from langchain_community.embeddings import HuggingFaceBgeEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from langchain_groq import ChatGroq
from langchain_community.embeddings import JinaEmbeddings 
from typing import List, Dict, Optional
from django.conf import settings
import random
import json

class GenerationModel:
    """Handles all text generation tasks using Groq's LLM"""
    
    def __init__(self, api_key: str):
        self.llm = ChatGroq(
            api_key=api_key,
            model_name="llama3-8b-8192",  
            temperature=0.5,  # Lower temperature for deterministic results
            max_tokens=512,  # Reduce token limit to speed up response
        )
    
    def generate_answer(self, question: str, context: str) -> str:
        prompt = f"""
        You are a helpful teacher who answers questions based ONLY on the provided context. 
        If the context doesn't contain enough information, say so.

        Context: {context}
        
        Question: {question}

        Answer:"""
        
        response = self.llm.invoke(prompt)
        return response.content.strip()
    
    def generate_quiz_question(self, context: str) -> Optional[Dict]:
        prompt = f"""
        Generate a multiple-choice question from the given context.
        Format your response as a JSON object:
        {{
            "question": "your question",
            "correct_answer": "correct option",
            "options": ["option1", "option2", "option3"]
        }}
        
        Context: {context}
        """
        
        response = self.llm.invoke(prompt)
        try:
            return json.loads(response.content)
        except:
            return None
    
    def generate_summary(self, text: str) -> str:
        prompt = f"""
        Summarize the following text in a concise manner:
        
        Text: {text}
        
        Summary:"""
        
        response = self.llm.invoke(prompt)
        return response.content.strip()
    
    def generate_qa_pairs(self, text: str) -> List[Dict]:
        """Generate possible Q&A pairs from a given text"""
        prompt = f"""
        Extract key concepts from the text and generate possible Q&A pairs in JSON format:
        [
            {{"question": "question1", "answer": "answer1"}},
            {{"question": "question2", "answer": "answer2"}}
        ]
        
        Text: {text}
        """
        
        response = self.llm.invoke(prompt)
        try:
            return json.loads(response.content)
        except:
            return []


class RetrievalSystem:
    """Handles document storage, embedding, and retrieval"""
    
    def __init__(self):
        self.embeddings = JinaEmbeddings(
            jina_api_key=settings.JINA_API_KEY,
            model_name="jina-embeddings-v2-base-en"
        )
        
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,  # Smaller chunks for faster retrieval
            chunk_overlap=100,
        )
        
        self.vector_stores = {}
    
    def add_documents(self, documents: List[Dict], user_id: int) -> None:
        docs = [Document(page_content=doc['content'], metadata={'id': doc['id']}) for doc in documents]
        split_docs = self.text_splitter.split_documents(docs)
        
        if user_id not in self.vector_stores:
            self.vector_stores[user_id] = FAISS.from_documents(split_docs, self.embeddings)
        else:
            self.vector_stores[user_id].add_documents(split_docs)
    
    def get_relevant_documents(self, query: str, user_id: int, k: int = 3) -> List[Document]:
        if user_id not in self.vector_stores:
            return []
        retriever = self.vector_stores[user_id].as_retriever(search_kwargs={"k": k})
        return retriever.get_relevant_documents(query)


class RAGAgent:
    """Integrates retrieval and generation for end-to-end RAG capabilities"""
    
    def __init__(self):
        groq_api_key = getattr(settings, 'GROQ_API_KEY', None)
        jina_api_key = getattr(settings, 'JINA_API_KEY', None)
        
        if not groq_api_key or not jina_api_key:
            raise ValueError("API keys must be set in Django settings")
        
        self.generator = GenerationModel(groq_api_key)
        self.retriever = RetrievalSystem()
    
    def add_documents(self, documents: List[Dict], user_id: int) -> None:
        """Expose add_documents method"""
        self.retriever.add_documents(documents, user_id)
    
    def answer_question(self, question: str, user_id: int) -> Dict:
        docs = self.retriever.get_relevant_documents(question, user_id)
        if not docs:
            return {"answer": "I don't have enough context.", "context": []}
        
        context = "\n\n".join([doc.page_content for doc in docs])
        answer = self.generator.generate_answer(question, context)
        
        return {"answer": answer, "context": [doc.page_content for doc in docs]}
    
    def generate_qa_from_documents(self, user_id: int, num_pairs: int = 5) -> List[Dict]:
        all_docs = self.retriever.get_relevant_documents("general knowledge", user_id, k=50)
        valid_docs = [doc for doc in all_docs if len(doc.page_content.strip()) > 50]
        qa_pairs = []
        
        for doc in valid_docs:
            new_pairs = self.generator.generate_qa_pairs(doc.page_content)
            qa_pairs.extend(new_pairs)
            if len(qa_pairs) >= num_pairs:
                break
        
        return qa_pairs[:num_pairs]
    
    def generate_quiz(self, user_id: int, num_questions: int = 5) -> List[Dict]:
        all_docs = self.retriever.get_relevant_documents("general knowledge", user_id, k=50)
        valid_docs = [doc for doc in all_docs if len(doc.page_content.strip()) > 50]
        quiz_questions = []
        
        for doc in valid_docs:
            question = self.generator.generate_quiz_question(doc.page_content)
            if question:
                quiz_questions.append(question)
            if len(quiz_questions) >= num_questions:
                break
        
        return quiz_questions[:num_questions]
