// upload.tsx
import React, {type FormEvent, useState} from 'react';
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import toast, {Toaster} from 'react-hot-toast';
import {usePuterStore} from "../../lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "../../lib/pdf2Image";
import {generateUID} from "~/utils/utils";
import {prepareInstructions} from "../../constants";

type analyzeResumeProps = {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
}

const Upload = () => {
    const {auth, isLoading, fs, ai, kv} = usePuterStore();
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [statusText, setStatusText] = useState(''); // State to manage status text

    // No need for a separate error state if react-hot-toast handles it,
    // as toast.error() directly triggers the notification.

    const handleFileSelect = (selectedFile: File | null) => {
        setFile(selectedFile);
        // Optional: clear any previous file-related errors if a file is now selected
        // However, toast notifications usually disappear on their own or are dismissed by user.
    }

    const handleAnalyze = async ({companyName, jobTitle, jobDescription, file}: analyzeResumeProps) => {
        setProcessing(true);
        setStatusText('Analyzing your resume...'); // Update status text
        toast.loading('Uploading your resume...'); // Show a loading toast

        const uploadedFile = await fs.upload([file]);

        if (!uploadedFile) {
            toast.error('Failed to upload the resume file.'); // Use toast.error()
            setProcessing(false);
            return;
        }

        toast.loading('Converting to image...'); // Show a loading toast for conversion

        const image = await convertPdfToImage(file);
        if (!image.file) {
            toast.error('Failed to convert the resume to an image.'); // Use toast.error()
            setProcessing(false);
            return;
        }

        toast.loading('Uploading image...'); // Show a loading toast for image upload
        const uploadedImage = await fs.upload([image.file]);
        if (!uploadedImage) {
            toast.error('Failed to upload the resume image.'); // Use toast.error()
            setProcessing(false);
            return;
        }

        toast.loading('Analyzing resume...'); // Show a loading toast for analysis

        const uuid = generateUID();
        const data = {
            id: uuid,
            resumePath: uploadedFile.path,
            imagePath: uploadedImage.path,
            companyName,
            jobTitle,
            jobDescription,
            feedback: '',
        }

        await kv.set(`resume:${uuid}`, JSON.stringify(data));

        const feedback = await ai.feedback(
            uploadedFile.path,
            prepareInstructions({jobTitle, jobDescription})
        )

        if (!feedback) {
            toast.error('Failed to analyze the resume.'); // Use toast.error()
            setProcessing(false);
            return;
        }

        const feedbackData = typeof feedback.message.content === 'string'
            ? feedback.message.content
            : feedback.message.content[0].text;

        data.feedback = JSON.parse(feedbackData);
        await kv.set(`resume:${uuid}`, JSON.stringify(data));

        toast.success('Resume analyzed successfully!'); // Use toast.success()
        setStatusText('Analysis complete! Redirecting ....'); // Update status text
        setProcessing(false);

        console.log(data);
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => { // Make handleSubmit async
        event.preventDefault();

        const form = event.currentTarget.closest('form');
        if (!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if (!file) {
            toast.error('Please upload a resume file.'); // Use toast.error()
            return;
        }

        if (!companyName || !jobTitle || !jobDescription) {
            toast.error('Please fill in all required fields.'); // Use toast.error()
            return;
        }

        await handleAnalyze({companyName, jobTitle, jobDescription, file});
    }

    return (
        <main className={'bg-[url(/images/bg-small.svg)] bg-cover'}>
            <Navbar/>
            <Toaster position="top-center" reverseOrder={false}/> {/* Add Toaster component here */}

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
export default Upload;