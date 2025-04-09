const sendRsp = (res, statusCode, message,errMsg = {})=>{
    let errortype = false;
    let status = 'success';

    if(statusCode !==200 && statusCode !==201) {
        errortype = true;
        status = 'error';
    }else if (statusCode === 500){
        errortype = true;
        status = 'error';
        console.log("errormsg:",errMsg)
    }else if (statusCode === 422){
        errortype = errMsg;
        status = 'error';
    }

    res.status(statusCode);
    res.send({
        statusCode: statusCode,
        message: message,
        status:status,
        error: errMsg
    })
}

export default sendRsp;
