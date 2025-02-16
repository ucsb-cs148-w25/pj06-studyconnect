import { getDocs, collection, query } from "firebase/firestore";
import { db } from './firebase';
import departmentMapping from "../assets/departmentMapping.json";

// Define the type for the department mapping
interface DepartmentMapping {
    [key: string]: string[];
}

// Cast the imported JSON to our interface
const typedDepartmentMapping = departmentMapping as DepartmentMapping;

type Professor = {
    id: string;
    firstName: string;
    lastName: string;
    avgRating: number;
    avgDifficulty: number;
    numRatings: number;
    wouldTakeAgainPercent: number;
    commentsSummarizedByGPT: string;
};

export async function fetchProfessorsByDepartment(departmentCode: string, courseInstructor: string): Promise<Professor[]> {
    const professors: Professor[] = [];
    const departmentNames = typedDepartmentMapping[departmentCode] || [];
    console.log('deartmentName mapped: ', departmentNames);

    try {
        for (const deptName of departmentNames) {
            const q = query(collection(db, `professors/${deptName}/profList`));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                professors.push({
                    id: doc.id,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    avgRating: data.avgRating,
                    avgDifficulty: data.avgDifficulty,
                    numRatings: data.numRatings,
                    wouldTakeAgainPercent: data.wouldTakeAgainPercent,
                    commentsSummarizedByGPT: data.comment
                });
            });
            
        }
        // console.log("number of prof from DB: ", professors.length);
        
        const matchedProfessor = professors.find((prof) => {
            const parts = courseInstructor.split(" ");
            if (parts.length < 2) return false;
            const [lastName, firstInitialWithDot] = parts;
            const firstInitial = firstInitialWithDot.replace(".", "");
            console.log("professor lastname: ", lastName.toLowerCase(), " first Initial: ", firstInitial.toLowerCase()); 
            return (
                prof.lastName.toLowerCase() === lastName.toLowerCase() &&
                prof.firstName[0].toLowerCase() === firstInitial.toLowerCase()
            );
        });
        
        return matchedProfessor ? [matchedProfessor] : [];
    } catch (error) {
        console.error("Error fetching professors:", error);
        return [];
    }
}
