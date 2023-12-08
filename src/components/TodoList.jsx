// src/components/TodoList.js
import React, { useState, useEffect } from 'react';

const TodoList = () => {
	const [todos, setTodos] = useState([]);
	const [newTodo, setNewTodo] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [sortByAlphabet, setSortByAlphabet] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch('http://localhost:3000/todos');
				const data = await response.json();
				setTodos(data);
			} catch (error) {
				console.error('Error fetching todos:', error);
			}
		};
		fetchData();
	}, []);

	const addTodo = async () => {
		try {
			const response = await fetch('http://localhost:3000/todos', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ text: newTodo }),
			});
			const data = await response.json();
			setTodos([...todos, data]);
			setNewTodo('');
		} catch (error) {
			console.error('Error adding todo:', error);
		}
	};

	const deleteTodo = async (id) => {
		try {
			await fetch(`http://localhost:3000/todos/${id}`, {
				method: 'DELETE',
			});
			setTodos(todos.filter(todo => todo.id !== id));
		} catch (error) {
			console.error('Error deleting todo:', error);
		}
	};

	const updateTodo = async (id, newText) => {
		try {
			await fetch(`http://localhost:3000/todos/${id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ text: newText }),
			});
			setTodos(todos.map(todo => (todo.id === id ? { ...todo, text: newText } : todo)));
		} catch (error) {
			console.error('Error updating todo:', error);
		}
	};

	let debounceTimeout;

	const performSearch = (term) => {
		clearTimeout(debounceTimeout);
		debounceTimeout = setTimeout(async () => {
			try {
				const response = await fetch(`http://localhost:3000/todos?text_like=${term}`);
				const data = await response.json();
				setTodos(data);
			} catch (error) {
				console.error('Error searching todos:', error);
			}
		}, 300);
	};

	const handleSearchChange = (e) => {
		const term = e.target.value;
		setSearchTerm(term);
		performSearch(term);
	};

	const filteredTodos = todos.filter(todo => todo.text.toLowerCase().includes(searchTerm.toLowerCase()));

	if (sortByAlphabet) {
		filteredTodos.sort((a, b) => a.text.localeCompare(b.text));
	}

	return (
		<div>
			<input type="text" placeholder="Add todo" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} />
			<button onClick={addTodo}>Add</button>
			<input type="text" placeholder="Search" value={searchTerm} onChange={handleSearchChange} />
			<button onClick={() => setSortByAlphabet(!sortByAlphabet)}>Sort Alphabetically</button>
			<ul>
				{filteredTodos.map(todo => (
					<li key={todo.id}>
						{todo.text}
						<button onClick={() => deleteTodo(todo.id)}>Delete</button>
						<button onClick={() => updateTodo(todo.id, prompt('Update todo', todo.text))}>Update</button>
					</li>
				))}
			</ul>
		</div>
	);
};

export default TodoList;