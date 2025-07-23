// FileUploader.tsx
import React, {useCallback} from 'react'
import {useDropzone} from "react-dropzone";
import {formatSize} from "~/utils";


interface FileUploaderProps {
    onFileSelect: (file: File | null) => void;
    selectedFile: File | null;
}

const FileUploader = ({onFileSelect, selectedFile}: FileUploaderProps) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0] || null;
        onFileSelect(file);
    }, [onFileSelect]);

    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop,
        multiple: false,
        accept: {
            'application/pdf': ['.pdf'],
        },
        maxSize: 20 * 1024 * 1024, // 20 MB
    });

    const fileToDisplay = selectedFile;

    return (
        <div className={'w-full gradient-border relative'}>
            <div
                {...getRootProps()}
                className={`
                    p-6 rounded-2xl text-center transition-all duration-300 ease-in-out
                    ${isDragActive ? 'border-2 border-dashed border-blue-500 bg-blue-50' : 'border border-gray-300'}
                    ${fileToDisplay ? 'cursor-default' : 'cursor-pointer'}
                `}
            >
                <input {...getInputProps()} />

                {isDragActive && (
                    <div className="absolute inset-0 bg-blue-300 bg-opacity-50 flex flex-col items-center justify-center rounded-2xl z-10 custom-fade-in">                        <svg
                            className="w-20 h-20 text-white mb-4 custom-bounce-y" // Changed here
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            ></path>
                        </svg>
                        <p className="text-white text-2xl font-bold">Drop Your PDF Here!</p>
                        <p className="text-white text-lg mt-2">Release to upload</p>
                    </div>
                )}

                <div className={'space-y-4'}>
                    {fileToDisplay ? (
                        <div className={'uploader-selected-file flex items-center justify-between p-3 bg-gray-50 rounded-2xl'}>
                            <img src={'/images/pdf.png'} alt={'pdf'} className={'size-10'}/>
                            <div className="flex-1 ml-4 overflow-hidden">
                                <p className={'text-sm font-medium text-gray-700 truncate max-w-[200px]'}>{fileToDisplay.name}</p>
                                <p className="text-sm text-gray-500">{formatSize(fileToDisplay.size)}</p>
                            </div>
                            <button
                                className={'p-2 rounded-full hover:bg-gray-100 transition-colors'}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onFileSelect(null);
                                }}
                            >
                                <img src={'/icons/cross.svg'} alt={'cross'} className={'size-4'}/>
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8">
                            <div className={'mx-auto w-16 h-16 flex items-center justify-center mb-4'}>
                                <img src={'/icons/info.svg'} alt={'upload'} className={'size-20'}/>
                            </div>
                            <p className={'text-lg text-gray-500'}>
                                <span className={'font-semibold'}>Click to upload</span> or drag and drop your file here
                            </p>
                            <p className={'text-lg text-gray-500 mt-2'}>PDF (max 20 MB)</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
export default FileUploader;