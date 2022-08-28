import React, { Component } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import qs from 'qs';
import Global from '../Global';

class ManageEpisode extends Component{
	url = Global.url;
	token = localStorage.getItem('token');

	titleRef = React.createRef();
	descriptionRef = React.createRef();

	state = {
		episode: {},
		avc_id: null,
		episode_id: null
	}

	componentDidMount(){
		this.getIdentity(this.token);
		var avc_id = this.props.avc_id;

		if(avc_id && (avc_id !== null || avc_id !== undefined)){
			this.setState({
				avc_id: avc_id
			});
		}

		/*
		var review_id = this.props.review_id;

		if(review_id && (review_id !== null || review_id !== undefined)){
			this.getReview(review_id);
			this.setState({
				review_id: review_id
			});
		}
		*/
	}


	handleChange = () => {
		this.setState({
			episode: {
				title: this.titleRef.current.value,
				description: this.descriptionRef.current.value
			}
		});
	}

	handleSubmit = (id) => (e) => {
		e.preventDefault();
		this.handleChange();

		var data = qs.stringify({
			'json':'{"title":"'+this.state.episode.title+'", "avc_id":'+id+', "description":"'+this.state.episode.description+'"}'
		});

		if(this.state.episode_id && this.state.episode_id !== null){
			var config = {
				method: 'put',
				url: this.url+'actualizar-episodio',
				headers: {'Content-Type':'application/x-www-form-urlencoded', 'Authorization':this.token.replace(/['"]+/g, '')},
				data: data
			}
		} else {
			var config = {
				method: 'post',
				url: this.url+'crear-episodio',
				headers: {'Content-Type':'application/x-www-form-urlencoded', 'Authorization':this.token.replace(/['"]+/g, '')},
				data: data
			}
		}

		axios(config)
			.then(res => {
				this.setState({
					review: res.data.episodio
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
		console.log(this.state.avc_id);
		return(
			<form className="form" onSubmit={this.handleSubmit(this.state.avc_id)}>
				<div className="form-group">
					<label htmlFor="title">Título</label>
					<input type="text" name="title" defaultValue={this.state.episode.title} ref={this.titleRef} onChange={this.handleChange} />
				</div>
				<div className="clearfix"></div>

				<div className="form-group">
					<label htmlFor="description">Plot</label>
					<textarea name="description" cols="25" rows="3" defaultValue={this.state.episode.description} ref={this.descriptionRef} onChange={this.handleChange}></textarea>
				</div>
				<div className="clearfix"></div>

				<div className="form-group">
					<input type="submit" value="Añadir" />
				</div>
			</form>
		);
	}
}
export default ManageEpisode;