import { NextResponse } from 'next/server';

const UCSB_API_KEY = process.env.UCSB_API_KEY || '';

export async function GET(
  req: Request,
) {
  const url = new URL(req.url)
  const quarter = url.searchParams.get('quarter')
  const pageSize = url.searchParams.get('pageSize') || 10
  const subjectCode = url.searchParams.get('subjectCode')

  if (!quarter) {
    return NextResponse.json({
      status: 400,
      message: 'Quarter is required',
    })
  }

  if (!subjectCode) {
    return NextResponse.json({
      status: 400,
      message: 'Subject code is required',
    })
  }

  try {
    const response = await fetch(`https://api.ucsb.edu/academics/curriculums/v3/classes/search?quarter=${quarter}&subjectCode=${encodeURIComponent(subjectCode)}&pageSize=${pageSize}`, {
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
