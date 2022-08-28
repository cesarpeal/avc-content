import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Global from '../Global';
import axios from 'axios';
import qs from 'qs';

function Register(){
	const url = Global.url;
	let navigate = useNavigate();

	const [user, setUser] = useState({
		nickname: '',
		email: '',
		password: ''
	});

	const handleChange = (e) => {
		setUser({
			...user,
			[e.target.name]: e.target.value,
		});
	}

	function handleSubmit(e){
		e.preventDefault();
		let data = qs.stringify({
			'json':'{"nickname":"'+user.nickname+'", "email":"'+user.email+'", "password":"'+user.password+'"}'
		});

		let config = {
			method: 'post',
			url: url+'registro',
			headers: {'Content-Type':'application/x-www-form-urlencoded'},
			data: data
		}

		axios(config)
			.then(
				navigate("/")
			);
	}

	return(
		<form className="form" onSubmit={handleSubmit}>
			<div className="form-group">
				<label htmlFor="nickname">Nickname:</label>
				<input type="text" name="nickname" value={user.nickname} onChange={handleChange} />
			</div>
			<div className="clearfix"></div>

			<div className="form-group">
				<label htmlFor="email">Email:</label>
				<input type="text" name="email" value={user.email} onChange={handleChange} />
			</div>
			<div className="clearfix"></div>

			<div className="form-group">
				<label htmlFor="password">Password:</label>
				<input type="password" name="password" value={user.password} onChange={handleChange} />
			</div>
			<div className="clearfix"></div>

			<div className="form-group">
				<input type="submit" value="Registrarse" />
			</div>
			<div className="clearfix"></div>
		</form>
	);
}
export default Register;