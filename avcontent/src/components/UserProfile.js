import React from 'react';
import Profile  from './Profile';
import {useParams} from 'react-router-dom';

function UserProfile() {

	let {user_id} = useParams();

	return (
			<React.Fragment>
				<Profile
				user_id={user_id}
				/>
			</React.Fragment>
	);
}

export default UserProfile;