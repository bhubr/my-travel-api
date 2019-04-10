const { exec } = require('child_process');
const images = require('./images.json');

const dlImg = (link, idx) => {
  	const suffix = idx.toString().padStart(2, '0');
  	exec(`wget -O images/img${suffix}.jpg ${link}`, { cwd: __dirname }, (err, stdout, stderr) => {
  		console.log('cmd', `wget -O images/img${suffix}.jpg ${link}`);
  		if (err) console.log('ERR', err.message);
  		else console.log('ok for', suffix);
  	})
  }

images.forEach((link, idx) => {
  setTimeout(() => dlImg(link, idx), 300);
});