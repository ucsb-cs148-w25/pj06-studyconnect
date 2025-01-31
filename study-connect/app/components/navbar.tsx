import Link from 'next/link';

export const Navbar = () => {
    return (
        <nav className="bg-blue-950 text-amber-500 p-4 sm:p-6 md:flex md:justify-between md:items-center">
            <div className="container mx-auto flex justify-between items-center">
                <a href="" className="text-2xl font-bold">
                    StudyConnect
                </a>
                <div className="hidden md:flex">
                    <Link href="/" className="mx-2 hover:text-gray-300">
                        Home 
                    </Link>
                    <Link href="/courses" className="mx-2 hover:text-gray-300">
                        Courses
                    </Link>
                    <Link href="/profile" className="mx-2 hover:text-gray-300">
                        Profile
                    </Link>
                </div>
            </div>
        </nav>
    );
};