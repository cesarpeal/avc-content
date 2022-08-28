import React, {useState, useEffect, Component} from 'react';
import {Link, Outlet, useNavigate} from 'react-router-dom';
import Global from '../Global';
import Aside from './Aside';
import axios from 'axios';
import qs from 'qs';

function Header(){
	const url = Global.url;
	let navigate = useNavigate();
	let token = localStorage.getItem("token");

	useEffect(() =>{
		if(!identity && token){
			token = token.replace(/['"]+/g, '');
			getIdentity(token);
		}
	});

	const [identity, setIdentity] = useState("");
	const [search, setSearch] = useState("");

	const handleSearchChange = (e) =>{
		setSearch(e.target.value);
	}

	function submitSearch(e){
		e.preventDefault();
		navigate("search/"+search);
	}

	const getIdentity = (token) => {
		let data = qs.stringify({
			'json':'{"user_id":'+null+'}'
		});

		let config = {
			method: 'post',
			url: url+'user-identity',
			headers: {'Content-Type':'application/x-www-form-urlencoded', 'Authorization':token},
			data: data
		};

		axios(config)
			.then(res => {
				setIdentity(res.data.user)
			});
	}

	return(
		<main>
			<header>
				<p id="pageTitle"><Link to="/">AVC REVIEWS</Link></p>
				<nav id="menu">
					<ul>
						<li><Link to="/">Películas</Link>
							<ul>
								<li><Link to="/">Top películas</Link></li>
								<li><Link to="/">Próximos estrenos</Link></li>
							</ul>
						</li>
						<li><Link to="/">Series</Link>
							<ul>
								<li><Link to="/">Top series</Link></li>
								<li><Link to="/">Próximos estrenos</Link></li>
							</ul>
						</li>
					</ul>
				</nav>
				<div id="searcher">
					<form onSubmit={submitSearch}>
							<input type="text" name="search" value={search} onChange={handleSearchChange} />
							<input className="icon" type="submit" value="L" />
					</form>
				</div>
				<div id="userHeader">
				{(token) ? (
					<p>Bienvenido <Link to="/mi-perfil">{identity.nickname}</Link></p>
					) : (
					<p><Link to="/login">Ingresa</Link> o <Link to="/registro">regístrate</Link> si no tienes cuenta</p>
					)
				}
				</div>
			</header>
			<section id="content">
				<div className="center">
					<Outlet />
				</div>
			</section>
			<Aside />
			<div className="clearfix"></div>
		</main>
	);
}
export default Header;