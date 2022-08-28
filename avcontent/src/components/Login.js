import React, { useState } from 'react';
import { useNavigate, } from 'react-router-dom';
import axios from 'axios';
import qs from 'qs';
import Global from '../Global';

function Login(){
	const url = Global.url;
	let navigate = useNavigate();
	const [user, setUser] = useState({
		email: '',
		password: ''
	});

	const handleChange = (e) => {
		setUser({
			...user,
			[e.target.name]: e.target.value
		});
	};

	function handleSubmit(e){
		e.preventDefault();
		let data = qs.stringify({
			'json':'{"email":"'+user.email+'", "password":"'+user.password+'", "gettoken":true}'
		})

		let config = {
			method: 'post',
			url: url+'login',
			headers: {'Content-Type':'application/x-www-form-urlencoded'},
			data: data
		}

		axios(config)
			.then( res => {
				if(res.data.status === 'error'){
					navigate("/");
				} else {
					localStorage.setItem('token', JSON.stringify(res.data));
					navigate("/");
				}
				
			});
	}

	return(
		<form className="form" onSubmit={handleSubmit}>
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
				<input type="submit" value="Loguearse" />
			</div>
			<div className="clearfix"></div>
		</form>
	);
}
export default Login;