from langchain_community.embeddings import HuggingFaceBgeEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from langchain_groq import ChatGroq
from typing import List, Dict, Optional
from django.conf import settings
import random 

class GenerationModel:
    """Handles all text generation tasks using Groq's LLM"""
    
    def __init__(self, api_key: str):
        self.llm = ChatGroq(
            api_key=api_key,
            model_name="mixtral-8x7b-32768",
            temperature=0.7,
            max_tokens=256,
        )
    
    def generate_answer(self, question: str, context: str) -> str:
        """Generate an answer based on context"""
        prompt = f"""You are a helpful teacher who helps students and answers their questions based only on the provided context. 
        If the context doesn't contain enough information, say so.

        Context: {context}

        Question: {question}

        Answer:"""
        
        response = self.llm.invoke(prompt)
        return response.content
    
    def generate_quiz_question(self, context: str) -> Optional[Dict]:
        """Generate a quiz question based on context"""
        prompt = f"""You are a helpful teacher who helps students study by creating quizzes for them. Based only on the following text, generate a multiple choice question with 3 options. 
        Format your response as a JSON object with the following structure:
        {{
            "question": "your question",
            "correct_answer": "correct option",
            "options": ["option1", "option2", "option3"]
        }}
        
        Text: {context}"""
        
        response = self.llm.invoke(prompt)
        try:
            return eval(response.content)
        except:
            return None
    
    def generate_summary(self, text: str) -> str:
        """Generate a summary of the provided text"""
        prompt = f"""Generate a concise summary of the following text. 
        Include the main points and key insights.

        Text: {text}

        Summary:"""
        
        response = self.llm.invoke(prompt)
        return response.content

class RetrievalSystem:
    """Handles document storage, embedding, and retrieval"""
    
    def __init__(self):
        # Initialize embedding model
        self.embeddings = HuggingFaceBgeEmbeddings(
            model_name="BAAI/bge-large-en-v1.5",
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )
        
        # Initialize text splitter
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        
        # Store vector databases per user
        self.vector_stores = {}
    
    def add_documents(self, documents: List[Dict], user_id: int) -> None:
        """Add documents to the vector store"""
        docs = [
            Document(
                page_content=doc['content'],
                metadata={'id': doc['id']}
            ) for doc in documents
        ]
        
        split_docs = self.text_splitter.split_documents(docs)
        
        if user_id not in self.vector_stores:
            self.vector_stores[user_id] = FAISS.from_documents(
                split_docs, 
                self.embeddings
            )
        else:
            self.vector_stores[user_id].add_documents(split_docs)
    
    def remove_documents(self, document_ids: List[int], user_id: int) -> None:
        """Remove documents from the vector store"""
        if user_id in self.vector_stores:
            remaining_docs = [
                doc for doc in self.vector_stores[user_id].get()
                if doc.metadata['id'] not in document_ids
            ]
            
            if remaining_docs:
                self.vector_stores[user_id] = FAISS.from_documents(
                    remaining_docs,
                    self.embeddings
                )
            else:
                del self.vector_stores[user_id]
    
    def get_relevant_documents(self, query: str, user_id: int, k: int = 3) -> List[Document]:
        """Retrieve relevant documents for a query"""
        if user_id not in self.vector_stores:
            return []
            
        retriever = self.vector_stores[user_id].as_retriever(
            search_kwargs={"k": k}
        )
        return retriever.get_relevant_documents(query)
    
    def get_document_chunks(self, document_id: int, user_id: int) -> List[Document]:
        """Get all chunks for a specific document"""
        if user_id not in self.vector_stores:
            return []
            
        return [
            doc for doc in self.vector_stores[user_id].get()
            if doc.metadata['id'] == document_id
        ]

class RAGAgent:
    """Integrates retrieval and generation for end-to-end RAG capabilities"""
    
    def __init__(self):
        groq_api_key = getattr(settings, 'GROQ_API_KEY', None)
        if not groq_api_key:
            raise ValueError("GROQ_API_KEY must be set in Django settings")
        
        self.generator = GenerationModel(groq_api_key)
        self.retriever = RetrievalSystem()
    
    def add_documents(self, documents: List[Dict], user_id: int) -> None:
        """Add documents to the system"""
        self.retriever.add_documents(documents, user_id)
    
    def remove_documents(self, document_ids: List[int], user_id: int) -> None:
        """Remove documents from the system"""
        self.retriever.remove_documents(document_ids, user_id)
    
    def answer_question(self, question: str, user_id: int) -> Dict:
        """Answer a question using RAG"""
        docs = self.retriever.get_relevant_documents(question, user_id)
        
        if not docs:
            return {
                "answer": "I don't have enough context to answer this question.",
                "context": []
            }
        
        context = "\n\n".join([doc.page_content for doc in docs])
        answer = self.generator.generate_answer(question, context)
        
        return {
            "answer": answer,
            "context": [doc.page_content for doc in docs]
        }
    
    def generate_quiz(self, user_id: int, num_questions: int = 5) -> List[Dict]:
        """Generate quiz questions from documents"""
        questions = []
        docs = self.retriever.get_relevant_documents("", user_id, k=num_questions * 2)
        
        # Randomly sample `num_questions` chunks
        sampled_docs = random.sample(docs, min(len(docs), num_questions))
        print(sampled_docs)
        
        for doc in sampled_docs:
            if question := self.generator.generate_quiz_question(doc.page_content):
                questions.append(question)
                if len(questions) >= num_questions:
                    break
        
        return questions

    def semantic_search(self, query: str, user_id: int, top_k: int = 5) -> List[Dict]:
        """Perform semantic search"""
        docs = self.retriever.get_relevant_documents(query, user_id, k=top_k)
        
        return [{
            "content": doc.page_content,
            "metadata": doc.metadata,
        } for doc in docs]
    
    def summarize_document(self, document_id: int, user_id: int) -> str:
        """Generate a document summary"""
        docs = self.retriever.get_document_chunks(document_id, user_id)
        
        if not docs:
            raise ValueError(f"Document {document_id} not found")
        
        full_text = "\n\n".join([doc.page_content for doc in docs])
        return self.generator.generate_summary(full_text)