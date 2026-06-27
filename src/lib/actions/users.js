export const GetAllUsers = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${apiUrl}/users`, {
        method: 'GET',
        headers:{
            'content-type': 'application/json'
        }
    });

    if(!res.ok){
        const text = await res.text();
        throw new Error(text);
    }

    return res.json();
}