export const CreateBook = async (NewBookData) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${apiUrl}/books`, {
        method: 'POST',
        headers:{
            'content-type': 'application/json'
        },
        body: JSON.stringify(NewBookData),
    });

    if(!res.ok){
        const text = await res.text();
        throw new Error(text);
    }

    return res.json();
}