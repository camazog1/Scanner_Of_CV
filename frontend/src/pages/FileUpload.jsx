import React from 'react';
import EditCV from '@components/EditCV';

function FileUpload() {
    const [file, setFile] = React.useState(null);

    return (
        <div className='w-100'>
            {
                file ?
                    <>
                    {/* Form to upload a file */}	
                        <h1>Upload a file</h1>
                        <form>
                            <input type="file" />
                            <button type="submit" onClick={() =>setFile(true)}>Upload</button>
                        </form>
                    </>
                    :
                    <>
                        <EditCV />
                    </>
            }

        </div>
    )
}

export default FileUpload;