import { NextResponse } from 'next/server';

const UCSB_API_KEY = process.env.UCSB_API_KEY || '';

export async function GET(
  req: Request,
) {
  const url = new URL(req.url)
  const quarter = url.searchParams.get('quarter')
  const pageSize = url.searchParams.get('pageSize') || 10
  const subjectCode = url.searchParams.get('subjectCode')
  const courseId = url.searchParams.get('courseId')
  const title = url.searchParams.get('title')

  if (!quarter) {
    return NextResponse.json({
      status: 400,
      message: 'Quarter is required',
    })
  }

  try {
    let apiUrl = `https://api.ucsb.edu/academics/curriculums/v3/classes/search?quarter=${quarter}&pageSize=${pageSize}&courseId=${courseId}`;
    if (subjectCode) {
      apiUrl += `&subjectCode=${encodeURIComponent(subjectCode)}`;
    }
    if (title) {
      apiUrl += `&title=${encodeURIComponent(title)}`;
    }
    if (courseId) {
      apiUrl += `&courseId=${encodeURIComponent(courseId)}`;
    }

    const response = await fetch(apiUrl, {
      headers: {
        'ucsb-api-key': UCSB_API_KEY,
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({
      status: 500,
      message: 'Internal server error',
    })
  }
}
