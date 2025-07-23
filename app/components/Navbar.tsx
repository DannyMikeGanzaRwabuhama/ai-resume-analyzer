import React from 'react'
import {Link} from "react-router";
import { usePuterStore } from "../../lib/puter";

const Navbar = () => {
    const { auth } = usePuterStore();

    const handleLogout = async () => {
        await auth.signOut();
        window.location.href = "/auth";
    };

    return (
        <nav className={'navbar'}>
            <Link to={"/"}>
                <p className={'text-2xl font-bold text-gradient'}>RESUME ANALYZER</p>
            </Link>
            <Link to={"/upload"} className={"primary-button w-fit"}>
                Upload Resume
            </Link>
            {auth.isAuthenticated && (
                <button onClick={handleLogout} className="secondary-button w-fit ml-4 cursor-pointer">
                    Logout
                </button>
            )}
        </nav>
    )
}
export default Navbar
