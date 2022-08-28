import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import qs from 'qs';
import axios from 'axios';
import Global from '../Global';

class Profile extends Component{
	url = Global.url;
	token = localStorage.getItem('token');

	state = {
		user: {},
		reviews: []
	}

	componentDidMount(){
		var user_id = this.props.user_id;

		if(user_id && (user_id !== null || user_id !== undefined)){
			this.getUser(user_id);
			this.getUserReviews(user_id);
		} else {
			this.getUser(null);
			this.getUserReviews(null);
		}
	}

	getUser = (user_id) => {
		var data = qs.stringify({
			'json':'{"user_id":'+user_id+'}'
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
					user: res.data.user
				});
			});
	}

	getUserReviews = (user_id) => {
		var data = qs.stringify({
			'json':'{"user_id":'+user_id+'}'
		});

		var config = {
			method: 'post',
			url: this.url+'user-reviews',
			headers: {'Content-Type':'application/x-www-form-urlencoded', 'Authorization':this.token.replace(/['"]+/g, '')},
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
		console.log(this.state.reviews);
		return(
			<React.Fragment>
				<p>{this.state.user.nickname}</p>
				<p>Reviews</p>
				{this.state.reviews.map((review) => {
					return(
						<div className="userReview">
							<p>{review.avc.title} - {review.score}</p>
							<p>{review.content}</p>
						</div>
					);
				})}
			</React.Fragment>
		);
	}
}
export default Profile;