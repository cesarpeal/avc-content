import React, { Component } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import qs from 'qs';
import Global from '../Global';

class AddContent extends Component{
	url = Global.url;
	token = localStorage.getItem('token');

	titleRef = React.createRef();
	descriptionRef = React.createRef();
	typeRef = React.createRef();
	durationRef = React.createRef();
	episodesRef = React.createRef();
	countryRef = React.createRef();
	directorRef = React.createRef();
	imageRef = React.createRef();

	state = {
		avc:{},
		image:{},
		avc_id: null,
		status: null
	}

	componentDidMount(){
		this.getIdentity(this.token);
		var avc_id = this.props.avc_id;
		console.log(avc_id);
		if(avc_id && (avc_id !== null || avc_id !== undefined)){
			this.getAvc(avc_id);
			this.setState({
				avc_id: avc_id
			});
		}
	}

	getAvc = (avc_id) =>{
		var config = {
			method: 'get',
			url: this.url+'avc/'+avc_id,
			headers: {'Content-Type':'application/x-www-form-urlencoded'}
		}

		axios(config)
			.then(res => {
				this.setState({
					avc: res.data.avc
				});
			});
	}

	handleChange = () => {
		this.setState({
			avc: {
				title: this.titleRef.current.value,
				description: this.descriptionRef.current.value,
				type: this.typeRef.current.value,
				duration: this.durationRef.current.value,
				episodes: this.episodesRef.current.value,
				country: this.countryRef.current.value,
				director: this.directorRef.current.value
			}
		});
	}

	fileChange = (e) => {
		this.setState({
			image: e.target.files[0]
		});
		this.forceUpdate();
	}

	handleSubmit = (e) => {
		e.preventDefault();
		this.handleChange();

		var data = qs.stringify({
			'json':'{"title":"'+this.state.avc.title+'","description":"'+this.state.avc.description+'","type":"'+this.state.avc.type+'","duration":"'+this.state.avc.duration+'","episodes":"'+this.state.avc.episodes+'","country":"'+this.state.avc.country+'","director":"'+this.state.avc.director+'", "avc_id":'+this.state.avc_id+'}'
		});

		if(this.state.avc_id && this.state.avc_id !== null){
			var config = {
				method: 'put',
				url: this.url+'actualizar-avc',
				headers: {'Content-Type':'application/x-www-form-urlencoded', 'Authorization':this.token.replace(/['"]+/g, '')},
				data: data
			}
		} else {
			var config = {
				method: 'post',
				url: this.url+'crear-avc',
				headers: {'Content-Type':'application/x-www-form-urlencoded', 'Authorization':this.token.replace(/['"]+/g, '')},
				data: data
			}
		}

		axios(config)
			.then(res => {
				this.setState({
					avc: res.data.avc
				});

				if(this.state.image !== null){
						const formData = new FormData();

						formData.append(
						 	'filename',
							 	this.state.image
						);

							var ifconfig = {
								method: 'post',
								url: this.url+'subir-imagen-avc/'+res.data.avc.id,
								headers: {'Authorization': this.token.replace(/['"]+/g, '')},
								data: formData
							};

							axios(ifconfig)
							 	.then(res => {
							 		this.setState({
							 			image: this.state.image,
										status: 'success'
							 		});
							});
				}
			});
			this.forceUpdate();
	}

	getIdentity = (token) => {
		var data = qs.stringify({
			'json':'{"user_id":'+null+'}'
		});

		var config = {
			method: 'post',
			url: this.url+'user-identity',
			headers: {'Content-Type':'application/x-www-form-urlencoded', 'Authorization':this.token.replace(/['"]+/g, '')},
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
		if(this.state.status === null){
			return(
				<form className="form" onSubmit={this.handleSubmit}>
					<div className="form-group">
						<label htmlFor="title">Título</label>
						<input type="text" name="title" defaultValue={this.state.avc.title} ref={this.titleRef} onChange={this.handleChange} />
					</div>
					<div className="clearfix"></div>

					<div className="form-group">
						<label htmlFor="description">Plot</label>
						<textarea name="description" cols="25" rows="3" defaultValue={this.state.avc.description} ref={this.descriptionRef} onChange={this.handleChange}></textarea>
					</div>
					<div className="clearfix"></div>

					<div className="form-group">
						<label htmlFor="type">Tipo</label>
						<select name="type" ref={this.typeRef} onChange={this.handleChange}>
							<option value="pelicula">pelicula</option>
							<option value="serie">serie</option>
						</select>
					</div>
					<div className="clearfix"></div>

					<div className="form-group">
						<label htmlFor="duration">Duración</label>
						<input type="text" name="duration" defaultValue={this.state.avc.duration} ref={this.durationRef} onChange={this.handleChange} />
					</div>
					<div className="clearfix"></div>

					<div className="form-group">
						<label htmlFor="episodes">Episodios</label>
						<input type="text" name="episodes" defaultValue={this.state.avc.episodes} ref={this.episodesRef} onChange={this.handleChange} />
					</div>
					<div className="clearfix"></div>

					<div className="form-group">
						<label htmlFor="director">Director</label>
						<input type="text" name="director" defaultValue={this.state.avc.director} ref={this.directorRef} onChange={this.handleChange} />
					</div>
					<div className="clearfix"></div>

					<div className="form-group">
						<label htmlFor="country">País</label>
						<input type="text" name="country" defaultValue={this.state.avc.country} ref={this.countryRef} onChange={this.handleChange} />
					</div>
					<div className="clearfix"></div>

					<div className="form-group-image">
						{this.state.avc.image &&
							<img className="avc-images" src={this.url+'imagen-avc/'+this.state.avc.image} />
						}
						<label htmlFor="image">Añadir imagen</label>
						<input type="file" name="file0" ref={this.imageRef} onChange={this.fileChange} />
					</div>

					<div className="form-group">
						<input type="submit" value="Añadir" />
					</div>
				</form>
			);
		} else if(this.state.status === 'success'){
			return(
				<Navigate replace to="/" />
			);
		}
	}
}
export default AddContent;