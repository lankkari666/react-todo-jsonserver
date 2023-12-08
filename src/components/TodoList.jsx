// src/components/TodoList.js
import { useEffect, useState } from 'react';
import firebase from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyCZbERVl2W1_fVpkBQaA7xgY7BaMTtW710",
  authDomain: "react-todo-firebase-84d3c.firebaseapp.com",
  databaseURL:
    "https://react-todo-firebase-84d3c-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "react-todo-firebase-84d3c",
  storageBucket: "react-todo-firebase-84d3c.appspot.com",
  messagingSenderId: "694121743336",
  appId: "1:694121743336:web:8b8b05099886d5fd91da5d",
};

firebase.initializeApp(firebaseConfig);

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortByAlphabet, setSortByAlphabet] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const todoCollection = await firebase
          .firestore()
          .collection("todos")
          .get();
        const data = todoCollection.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTodos(data);
      } catch (error) {
        console.error("Error fetching todos:", error);
      }
    };
    fetchData();
  }, []);

  const addTodo = async () => {
    try {
      const todoRef = await firebase
        .firestore()
        .collection("todos")
        .add({ text: newTodo });
      const todo = { id: todoRef.id, text: newTodo };
      setTodos([...todos, todo]);
      setNewTodo("");
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await firebase.firestore().collection("todos").doc(id).delete();
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const updateTodo = async (id, newText) => {
    try {
      await firebase
        .firestore()
        .collection("todos")
        .doc(id)
        .update({ text: newText });
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, text: newText } : todo
        )
      );
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const performSearch = async (term) => {
    try {
      const todoCollection = await firebase
        .firestore()
        .collection("todos")
        .where("text", ">=", term)
        .get();
      const data = todoCollection.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTodos(data);
    } catch (error) {
      console.error("Error searching todos:", error);
    }
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    performSearch(term);
  };

  const filteredTodos = todos.filter((todo) =>
    todo.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (sortByAlphabet) {
    filteredTodos.sort((a, b) => a.text.localeCompare(b.text));
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Add todo"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
      />
      <button onClick={addTodo}>Add</button>
      <input
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <button onClick={() => setSortByAlphabet(!sortByAlphabet)}>
        Sort Alphabetically
      </button>
      <ul>
        {filteredTodos.map((todo) => (
          <li key={todo.id}>
            {todo.text}
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
            <button
              onClick={() =>
                updateTodo(todo.id, prompt("Update todo", todo.text))
              }
            >
              Update
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
