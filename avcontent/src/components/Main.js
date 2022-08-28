import React, { Component, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import axios from 'axios';
import qs from 'qs';
import Global from '../Global';
import CreateEpisode from './CreateEpisode';

class Main extends Component{
	url = Global.url;
	token = localStorage.getItem('token');

	state = {
		avcs: [],
		avc: {},
		busqueda: null,
		identity: {},
		status: null,
		review: {},
		edit: null,
		episodes: [],
		episode: {},
		reviews: []
	}

	componentDidMount(){
		var search = this.props.search;
		var avc_id = this.props.avc_id;
		var review_id = this.props.review_id;
		var episode_id = this.props.episode_id;

		if(this.token){
			this.getIdentity();
		}

		if(search && (search !== null || search !== undefined)){
			this.search(search);
		} else if(avc_id && !episode_id){
			this.getAvc(avc_id);
			this.getUserReview(avc_id, null);
			this.getAvcEpisodes(avc_id);
			this.getReviews(avc_id, null);
		} else if(episode_id && avc_id){
			this.getEpisode(episode_id);
			this.setState({
				episode_id: episode_id
			});
			this.getUserReview(avc_id, episode_id);
			this.getReviews(avc_id, episode_id);
			if(review_id && (review_id !== null || review_id !== undefined)){
				this.setState({
					review_id: review_id
				});
			}
		} else {
			this.home();
		}
	}

	home = () => {
		var config = {
			method: 'get',
			url: this.url+'home',
			headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		}

		axios(config)
			 .then(res => {
			 	this.setState({
			 		avcs: res.data.avcs,
			 		status: 'success'
			 	});
			 })
			 .catch(err => {
			 	this.setState({
				 	avcs: [],
				 	status: 'success'
				 });
			 });;
	}

	search = (search) => {
		var config = {
			method: 'get',
			url: this.url+'busqueda/'+search,
			headers: {'Content-Type':'application/x-www-form-urlencoded'}
		}

		axios(config)
			.then(res => {
				this.setState({
					avcs: res.data.avc,
					busqueda: search
				});
			});
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
					avc: res.data.avc,
					status: 'single-avc'
				});
			});
	}

	getUserReview = (avc_id, episode_id) => {
		var data = qs.stringify({
			'json':'{"avc_id":'+avc_id+',"episode_id":'+episode_id+'}'
		});

		var config = {
			method: 'post',
			url: this.url+'user-review',
			headers: {'Content-Type':'application/x-www-form-urlencoded', 'Authorization':this.token.replace(/['"]+/g, '')},
			data: data
		}

		axios(config)
			.then(res => {
				this.setState({
					review: res.data.review
				});
			});
	}

	deleteAvc = (avc_id) => (e) => {
		e.preventDefault();

		var data = qs.stringify({
			'json':'{"avc_id":'+avc_id+'}'
		});

		var config = {
			method: 'delete',
			url: this.url+'borrar-avc',
			headers: {'Content-Type':'application/x-www-form-urlencoded', 'Authorization':this.token.replace(/['"]+/g, '')},
			data: data
		}

		axios(config)
			.then(res => {
				this.setState({
					status: 'deleted'
				});
			});
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
		}

		axios(config)
			.then(res => {
				this.setState({
					identity: res.data.user
				});
			});
	}

	edit = () => {
		this.setState({
			edit: 'edit'
		});
		this.forceUpdate();
	}

	getAvcEpisodes = (avc_id) => {
		var data = qs.stringify({
			'json':'{"avc_id":'+avc_id+'}'
		});

		var config = {
			method: 'post',
			url: this.url+'episodios',
			headers: {'Content-Type':'application/x-www-form-urlencoded'},
			data: data
		}

		axios(config)
			.then(res => {
				this.setState({
					episodes: res.data.episodes
				});
			});
	}

	getEpisode = (episode_id) => {
		var config = {
			method: 'get',
			url: this.url+'episodio/'+episode_id,
			headers: {'Content-Type':'application/x-www-form-urlencoded'}
		}

		axios(config)
			.then(res => {
				this.setState({
					episode: res.data.episode
				});
			});
	}

	getReviews = (avc_id, episode_id) => {
		var data = qs.stringify({
			'json':'{"avc_id":'+avc_id+',"episode_id":'+episode_id+'}'
		});

		var config = {
			method: 'post',
			url: this.url+'reviews',
			headers: {'Content-Type':'application/x-www-form-urlencoded'},
			data: data
		}

		axios(config)
			.then(res => {
				this.setState({
					reviews: res.data.reviews
				});
			});
	}

	render(){
		if(this.state.avcs.length >= 1 && this.state.status === 'success'){
			var Avcs = this.state.avcs.map((avc) => {
				return(
					<article className="avc-box">
						<img className="avc-images" src={this.url+'imagen-avc/'+avc.image} />
						<div className="avc-data">
							<p><Link to={"/avc/"+avc.id}>{avc.title}</Link></p>
							{(avc.type === 'serie') ? (
								<React.Fragment>
									<p>Duración {avc.duration} min por episodio</p>
									<p>{avc.episodes} episodios</p>
								</React.Fragment>
								) : (
								<p>Duración {avc.duration} min</p>
								)
							}
						</div>
					</article>
				);
			});

			return(
				<React.Fragment>
					{this.state.busqueda === null &&
						<h2 id="lastcontent">Últimos contenidos</h2>
					}
					<div id="avc-boxes">
						{Avcs}
					</div>
				</React.Fragment>
			);
		} else if(this.state.avc && this.state.status === 'single-avc'){
			return(
				<div className="singleAvc">
					<h2>{this.state.avc.title}</h2>
					<button onClick={this.deleteAvc(this.state.avc.id)}>Borrar avc</button>
					<Link to={/actualizar-avc/+this.state.avc.id}>Actualizar avc</Link>
					{this.state.review &&
						(this.state.review.id) ? (
							(this.state.edit !== 'edit') ? (
								<div className="user-review">
									<h2>Tu reseña</h2>
									<h3>Puntuación: {this.state.review.score}/10</h3>
									<p>{this.state.review.content}</p>
									<button onClick={this.edit}>Editar reseña</button>
								</div>
							) : (
								<div className="user-review">
									<ManageReview avc_id={this.state.avc.id} review_id={this.state.review.id}/>
								</div>
							)
						) : (
							<div className="user-review">
								<ManageReview avc_id={this.state.avc.id} />
							</div>

						)
					}
					<div className="clearfix"></div>
					<div className="reviews">
						{this.state.reviews.map((review) => {
							return(
								<React.Fragment>
									<h3>{review.user.nickname} - {review.score}</h3>
									<p>{review.content}</p>
								</React.Fragment>
							);
						})}
					</div>
					{this.state.avc.type === 'serie' && this.state.identity.role === 'admin' &&
						<div id="create-episode">
							<CreateEpisode avc_id={this.state.avc.id} />
						</div>
					}
					<div className="episodes">
					{this.state.episodes.map((episode) => {
						return(
							<Link to={"episodio/"+episode.id}>{episode.title}</Link>
						);
					})}
					</div>
				</div>
			);
		} else if(this.state.episode) {
			return(
				<React.Fragment>
					<h2>{this.state.episode.title}</h2>
					{this.state.review &&
						(this.state.review.id) ? (
							(this.state.edit !== 'edit') ? (
								<div className="user-review">
									<h2>Tu reseña</h2>
									<h3>Puntuación: {this.state.review.score}/10</h3>
									<p>{this.state.review.content}</p>
									<button onClick={this.edit}>Editar reseña</button>
								</div>
							) : (
								<div className="user-review">
									<ManageReview avc_id={this.state.episode.id} review_id={this.state.review.id}/>
								</div>
							)
						) : (
							<div className="user-review">
								<ManageReview avc_id={this.state.episode.id} />
							</div>
						)
					}
					<div className="reviews">
						{this.state.reviews.map((review) => {
							return(
								<React.Fragment>
									<h3>{review.user.nickname} - {review.score}</h3>
									<p>{review.content}</p>
								</React.Fragment>
							);
						})}
					</div>
				</React.Fragment>
			);
		} else if(this.state.status === 'deleted'){
			<Navigate replace to="/" />
		} else if(this.state.avcs.length === 0 && this.state.status === 'success'){
			return(
				<h3>No hay contenido que mostrar</h3>
			);
		} else {
			return(
				<h4>Cargando...</h4>
			);
		}
	}
}

class ManageReview extends Component{
	url = Global.url;
	token = localStorage.getItem('token');

	contentRef = React.createRef();
	scoreRef = React.createRef();

	state = {
		review: {},
		avc_id: null,
		episode_id: null,
		identity: {},
		review_id: null
	}

	componentDidMount(){
		if(this.token){
			this.getIdentity();
		
			var avc_id = this.props.avc_id;
			var review_id = this.props.review_id;
			var episode_id = this.props.episode_id;

			if(avc_id && (avc_id !== null || avc_id !== undefined)){
				this.setState({
					avc_id: avc_id
				});

				if(review_id && (review_id !== null || review_id !== undefined)){
					this.getUserReview(avc_id, episode_id);
					this.setState({
						review_id: review_id
					});
				}
			} else if(episode_id && (episode_id !== null || episode_id !== undefined)){
				this.setState({
					episode_id: episode_id
				});

				if(review_id && (review_id !== null || review_id !== undefined)){
					this.getUserReview(avc_id, episode_id);
					this.setState({
						review_id: review_id
					});
				}
			}
		}
	}

	getUserReview = (avc_id, episode_id) => {
		var data = qs.stringify({
			'json':'{"avc_id":'+avc_id+',"episode_id":'+episode_id+'}'
		});

		var config = {
			method: 'post',
			url: this.url+'user-review',
			headers: {'Content-Type':'application/x-www-form-urlencoded', 'Authorization':this.token.replace(/['"]+/g, '')},
			data: data
		}

		axios(config)
			.then(res => {
				this.setState({
					review: res.data.review
				});
			});
	}

	handleChange = () => {
		this.setState({
			review: {
				content: this.contentRef.current.value,
				score: this.scoreRef.current.value
			}
		});
	}

	handleSubmit = (e) => {
		e.preventDefault();
		this.handleChange();

		var data = qs.stringify({
			'json':'{"content":"'+this.state.review.content+'","score":'+this.state.review.score+', "avc_id":'+this.state.avc_id+', "review_id":'+this.state.review_id+', "episode_id":'+null+'}'
		});

		if(this.state.review_id && this.state.review_id !== null){
			var config = {
				method: 'put',
				url: this.url+'actualizar-review',
				headers: {'Content-Type':'application/x-www-form-urlencoded', 'Authorization':this.token.replace(/['"]+/g, '')},
				data: data
			}
		} else {
			var config = {
				method: 'post',
				url: this.url+'crear-review',
				headers: {'Content-Type':'application/x-www-form-urlencoded', 'Authorization':this.token.replace(/['"]+/g, '')},
				data: data
			}
		}

		axios(config)
			.then(res => {
				this.setState({
					review: res.data.review
				});
			});
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
		return(
			<form className="form-review" onSubmit={this.handleSubmit}>
				<div className="form-group">
					<label htmlFor="content">Reseña</label>
					<textarea name="content" cols="25" rows="3" defaultValue={this.state.review.content} ref={this.contentRef} onChange={this.handleChange}></textarea>
				</div>
				<div className="clearfix"></div>

				<div className="form-group">
					<label htmlFor="score">Puntuación</label>
					<select name="score" ref={this.scoreRef} value={this.state.review.score} onChange={this.handleChange}>
						<option value="1">1</option>
						<option value="2">2</option>
						<option value="3">3</option>
						<option value="4">4</option>
						<option value="5">5</option>
						<option value="6">6</option>
						<option value="7">7</option>
						<option value="8">8</option>
						<option value="9">9</option>
						<option value="10">10</option>
					</select>
				</div>
				<div className="clearfix"></div>

				<div className="form-group">
					<input type="submit" value="Añadir" />
				</div>
			</form>
		);
	}
}

export default Main;