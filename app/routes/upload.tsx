import React, {type FormEvent, useState} from 'react';
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import toast, {Toaster} from 'react-hot-toast';
import {usePuterStore} from "../../lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "../../lib/pdf2Image";
import {generateUID} from "~/utils";
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
        // Initial state setup for processing feedback
        setProcessing(true);
        setStatusText('Uploading your resume...');
        toast.loading('Starting upload...'); // Start a loading toast for the whole process

        try {
            const uploadedFile = await fs.upload([file]);
            if (!uploadedFile) {
                throw new Error('Failed to upload the resume file.');
            }

            setStatusText('Converting to image...');
            // The loading toast from above will update its message if you call toast.loading again.
            // Or you can create a new one, but for sequential steps, updating is often smoother.
            // For distinct steps like this, you might prefer to update the existing one.
            // For simplicity, let's assume the initial loading toast covers the "overall" process.

            const image = await convertPdfToImage(file);
            if (!image.file) {
                throw new Error('Failed to convert the resume to an image.');
            }

            setStatusText('Uploading image...');
            const uploadedImage = await fs.upload([image.file]);
            if (!uploadedImage) {
                throw new Error('Failed to upload the resume image.');
            }

            setStatusText('Analyzing resume...');
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
            );

            if (!feedback) {
                throw new Error('AI analysis failed to provide feedback.');
            }

            const feedbackData = typeof feedback.message.content === 'string'
                ? feedback.message.content
                : feedback.message.content[0].text;

            data.feedback = JSON.parse(feedbackData);
            await kv.set(`resume:${uuid}`, JSON.stringify(data));

            // --- Success Handling with Timeout ---
            toast.success('Resume analyzed successfully!'); // Show success toast
            setStatusText('Analysis complete! Redirecting in 2 seconds...'); // Update status text

            // Set a timeout before redirection
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds (2000 milliseconds)

            console.log(data);
            // Redirect to the resume details page
            navigate(`/resume/${uuid}`);

        } catch (error) {
            // Centralized error handling
            console.error('Analysis error:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during analysis.';
            toast.error(errorMessage); // Show error toast
            setStatusText('Analysis failed.');
        } finally {
            // Ensure processing state is reset regardless of success or failure
            setProcessing(false);
            // Optionally dismiss the loading toast if it's still there and you didn't auto-dismiss it with success/error toast
            // toast.dismiss(); // Use this if you want to explicitly clear all toasts at the end
        }
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