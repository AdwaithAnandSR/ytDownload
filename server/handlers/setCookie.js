import fs from "fs";

function convertToNetscapeCookies(cookieString, domain = ".youtube.com") {
    const cookies = cookieString.split("; ").map(cookie => {
        const [name, ...valParts] = cookie.split("=");
        const value = valParts.join("=");
        return {
            domain,
            flag: "TRUE",
            path: "/",
            secure: "FALSE",
            expires: 2147483647,
            name: name.trim(),
            value: value.trim()
        };
    });

    let output = "# Netscape HTTP Cookie File\n";
    cookies.forEach(c => {
        output += `${c.domain}\t${c.flag}\t${c.path}\t${c.secure}\t${c.expires}\t${c.name}\t${c.value}\n`;
    });
    return output;
}

const handleSetCookie = async (req, res) => {
    let { cookie } = req.body;

    const newCookie = convertToNetscapeCookies(cookie);
    fs.writeFileSync("cookies.txt", newCookie);
    
    res.json({ newCookie })
};

export default handleSetCookie;
