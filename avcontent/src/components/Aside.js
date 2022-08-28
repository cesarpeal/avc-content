import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import qs from 'qs';
import Global from '../Global';

class Aside extends Component{
	url = Global.url;
	token = localStorage.getItem('token');

	state = {
		identity: {}
	}

	componentDidMount(){
		if(this.token){
			this.getIdentity(this.token);
		}
	}

	getIdentity = (token) => {
		var data = qs.stringify({
			'json':'{"user_id":'+null+'}'
		});

		var config = {
			method: 'post',
			url: this.url+'user-identity',
			headers: {'Content-Type':'application/x-www-form-urlencoded', 'Authorization':token.replace(/['"]+/g, '')},
			data: data
		};

		axios(config)
			.then(res => {
				this.setState({
					identity: res.data.user
				});
			});
	}

	render(){
		return(
			<aside>
				{this.state.identity.role === 'admin' &&
					<Link className="button" to="/crear-contenido">Añadir contenido</Link>
				}
			</aside>
		);
	}
}
export default Aside;