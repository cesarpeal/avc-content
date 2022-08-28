import React, {Component} from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Header from './components/Header';
import Register from './components/Register';
import Login from './components/Login';
import Main from './components/Main';
import Search from './components/Search';
import AddContent from './components/AddContent';
import EditContent from './components/EditContent';
import Episode from './components/Episode';
import Avc from './components/Avc';
import Profile from './components/Profile';
import UserProfile from './components/UserProfile';



class Router extends Component{

	render(){
		return(
			<BrowserRouter>
					<Routes>
						<Route path="/" element={<Header />}>
							<Route path="/" element={<Main />} />
							<Route path="/registro" element={<Register />} />
							<Route path="/login" element={<Login />} />
							<Route path="/crear-contenido" element={<AddContent />} />
							<Route path="/search/:search" element={<Search />} />
							<Route path="/avc/:avc_id" element={<Avc />} />
							<Route path="/actualizar-avc/:avc_id" element={<EditContent />} />
							<Route path="/avc/:avc_id/episodio/:episode_id" element={<Episode />} />
							<Route path="/mi-perfil" element={<Profile />} />
							<Route path="/perfil-usuario/:user_id" element={<UserProfile />} />
							<Route path="*" element={<div>404 Not found</div>} />
						</Route>
					</Routes>
			</BrowserRouter>
		);
	}
}

export default Router;