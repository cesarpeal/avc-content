import React from 'react';
import ManageEpisode  from './ManageEpisode';
import {useParams} from 'react-router-dom';

function CreateEpisode() {

	let {avc_id} = useParams();

	return (
			<React.Fragment>
				<ManageEpisode
						avc_id={avc_id}
				/>
			</React.Fragment>
	);
}

export default CreateEpisode;