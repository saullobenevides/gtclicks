const username = '@saullo_c_benevides_3360';
const encodedUsername = encodeURIComponent(username);
const url = `http://localhost:3000/api/fotografos/by-username/${username}/fotos`;
const encodedUrl = `http://localhost:3000/api/fotografos/by-username/${encodedUsername}/fotos`;

console.log('Testing API with raw username:', url);
fetch(url)
  .then(res => {
    console.log('Raw URL Status:', res.status);
    return res.text();
  })
  .then(text => console.log('Raw URL Response:', text.substring(0, 200)))
  .catch(err => console.error('Raw URL Error:', err));

console.log('Testing API with encoded username:', encodedUrl);
fetch(encodedUrl)
  .then(res => {
    console.log('Encoded URL Status:', res.status);
    return res.text();
  })
  .then(text => console.log('Encoded URL Response:', text.substring(0, 200)))
  .catch(err => console.error('Encoded URL Error:', err));
