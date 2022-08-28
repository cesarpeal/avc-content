import React from 'react';
import AddContent  from './AddContent';
import {useParams} from 'react-router-dom';

function EditAvc() {

	let {avc_id} = useParams();

	return (
			<React.Fragment>
				<AddContent
						avc_id={avc_id}
				/>
			</React.Fragment>
	);
}

export default EditAvc;