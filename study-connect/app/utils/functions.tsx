import { Instructor, TimeLocation } from "./interfaces";

export const fetchClasses = async (response: any) => {
    const data = response.classes;
    const newClasses = data.map((cls: any) => {
        let courseDetails: { instructor: Instructor; timeLocation: TimeLocation[] }[] = [];
        // current method of processing instructors for each course is inconsistent for multiple instructors
        // does not account for courses with multiple instructors (ex. WINTER 2025 MATH 4B)
        // also may be slightly buggy for courses with no instructors
        let currLeadInstructors: Instructor[] = [];
        cls.classSections.map((section: any) => {
            const sectionInstructors = section.instructors;
            const sectionTimeLocations = section.timeLocations;
            
            let newLeadInstructors: Instructor[] = [];
            sectionInstructors.forEach((instructor: any) => {
                if (instructor.functionCode === "Teaching and in charge") {
                newLeadInstructors.push({name: instructor.instructor, functionCode: instructor.functionCode});
                }
            });
            
            if (newLeadInstructors.length > 0 && newLeadInstructors !== currLeadInstructors) {
                currLeadInstructors = newLeadInstructors;
            }

            const instructorNames = currLeadInstructors.map((instructor: Instructor) => instructor.name);

            courseDetails.push({
                instructor: {name: instructorNames.join(" & "), functionCode: "Teaching and in charge"},
                timeLocation: sectionTimeLocations,
            });
        });

        return {
        courseId: cls.courseId,
        courseTitle: cls.title,
        courseDescription: cls.description,
        courseInstructors: cls.classSections.map((section: any) => section.instructors),
        courseTimeLocations: cls.classSections.map((section: any) => section.timeLocations as TimeLocation[]),
        courseDetails: courseDetails,
        }
    });
    return newClasses;
};

export const fetchClassByCourseId = async (courseId: string, quarter: string) => {
    try {
        const response = await fetch(`/api/classes/?quarter=${quarter}&courseId=${encodeURIComponent(courseId.split(" ").join(""))}&pageSize=100`);
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        console.log("data", data);
        
        // Fetch and process the classes
        const class_ = await fetchClasses(data);
        console.log("class_: ", class_);
  
        return class_[0];  // Ensure we return the course data
    } catch (error) {
        console.error("Error fetching course data:", error);
        return null;
    }
}