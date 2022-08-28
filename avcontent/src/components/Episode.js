import React from 'react';
import Main  from './Main';
import {useParams} from 'react-router-dom';

function Episode() {

	let {episode_id} = useParams();
	let {avc_id} = useParams();

	return (
			<React.Fragment>
				<Main
				avc_id={avc_id}
				episode_id={episode_id}
				/>
			</React.Fragment>
	);
}

export default Episode;