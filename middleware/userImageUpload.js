const multer = require('multer');
const { v4 } = require('uuid')

const storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, 'public/img/users/');
  },
  filename: function (req, file, callback) {
    let extension = getMimeType(file.mimetype)
    let size = file.size
    if(!extension){
        const error = new Error()
        error.path = '/dashboard/profile?error=Only jpg,jpeg,gif and png files are allowed';
        error.isAjax = false 
        req.session.setError = true
        callback(error)
    }
    else callback(null, v4()+extension);
  },

});

function getMimeType(mimetype) {
    if(mimetype == 'image/jpeg') return '.jpeg'
    if(mimetype == 'image/png') return '.png'
    if(mimetype == 'image/jpg') return '.jpg'
    if(mimetype == 'image/gif') return '.gif'
    return false
}

module.exports = {userUpload: multer({dest: 'public/img/users/',storage:storage})}