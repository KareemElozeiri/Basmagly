import axios from 'axios';
import Cookies from 'js-cookie';


export default axios.create({
    baseURL: 'http://localhost:3500'
});