import React, {type FormEvent, useState} from 'react';
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";

const Upload = () => {
    const [processing, setProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null); // State to hold the file

    const handleFileSelect = (selectedFile: File | null) => {
        setFile(selectedFile); // Update the file state in the parent
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const form = event.currentTarget.closest('form');
        if (!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if (!file) { // Use the 'file' state here
            alert('Please upload a resume file.');
            return;
        }

        if (!companyName || !jobTitle || !jobDescription) {
            alert('Please fill in all fields.');
            return;
        }
        setProcessing(true);
        setStatusText('Processing your resume...');

        console.log({
            companyName,
            jobTitle,
            jobDescription,
            file // The correct file from the state
        })

        // In a real application, you would send this data to a server
        // Example:
        // const dataToSend = new FormData();
        // dataToSend.append('companyName', companyName);
        // dataToSend.append('jobTitle', jobTitle);
        // dataToSend.append('jobDescription', jobDescription);
        // if (file) {
        //     dataToSend.append('resume', file);
        // }
        //
        // try {
        //     const response = await fetch('/api/process-resume', {
        //         method: 'POST',
        //         body: dataToSend,
        //     });
        //     const result = await response.json();
        //     console.log(result);
        //     setStatusText('Resume processed successfully!');
        // } catch (error) {
        //     console.error('Error processing resume:', error);
        //     setStatusText('Error processing resume.');
        // } finally {
        //     setProcessing(false);
        // }
    }

    return (
        <main className={'bg-[url(/images/bg-small.svg)] bg-cover'}>
            <Navbar/>

            <section className={'main-section'}>
                <div className={'page-heading'}>
                    <h1>Smart feedback for your dream job</h1>
                    {processing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src={'/images/resume-scan.gif'} alt={'resume scan'}/>
                        </>
                    ) : (
                        <>
                            <h2>Drop your resume for an ATS score and an improvement score</h2>
                            <form
                                id={'upload-form'}
                                className={'flex flex-col gap-4 mt-8'}
                                onSubmit={handleSubmit}>
                                <div className={'form-div'}>
                                    <label htmlFor={'company-name'}>Company Name</label>
                                    <input type={'text'} name={'company-name'} placeholder={'company name'}/>
                                </div>
                                <div className={'form-div'}>
                                    <label htmlFor={'job-title'}>Job Title</label>
                                    <input type={'text'} name={'job-title'} placeholder={'job title'}/>
                                </div>
                                <div className={'form-div'}>
                                    <label htmlFor={'job-description'}>Job Description</label>
                                    <textarea name={'job-description'} rows={4} placeholder={'job description'}/>
                                </div>
                                <div className={'form-div'}>
                                    <label htmlFor={'uploader'}>Upload Resume</label>
                                    {/* Pass the 'file' state down as a prop */}
                                    <FileUploader onFileSelect={handleFileSelect} selectedFile={file}/>
                                </div>
                                <button className={'primary-button'} type={'submit'}>Analyze Resume</button>
                            </form>
                        </>
                    )}
                </div>
            </section>
        </main>
    )
}
export default Upload
