import React from 'react';
import Main  from './Main';
import {useParams} from 'react-router-dom';

function Avc() {

	let {avc_id} = useParams();

	return (
			<React.Fragment>
				<Main
				avc_id={avc_id}
				/>
			</React.Fragment>
	);
}

export default Avc;