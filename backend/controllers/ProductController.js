import Product from "../models/ProductModel.js";
import path from 'path';
import fs from 'fs'

export const getProduct=async(req,res)=>{
    try {
        const response = await Product.findAll();
        res.json(response);
    } catch (error) {
        console.log(error);
    }
}

export const getProductById=async(req,res)=>{
    try {
        const response = await Product.findOne({
            where: {
                id: req.params.id
            }
        });
        res.json(response);
    } catch (error) {
        console.log(error);
    }
}

export const saveProduct=async(req,res)=>{
    if(req.files === null) return res.status(400).json({msg:"no files uploaded"})
    const name = req.body.title;
    const file = req.files.file;
    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    const fileName = file.md5 + ext; 
    const url =`${req.protocol}://${req.get("host")}/images/${fileName}`;
    const allowedType =['.png','.jpg','jpeg'];

    if(!allowedType.includes(ext.toLocaleLowerCase())) return res.status(422).json({
        msg:"invalid image type"});
    if(fileSize>5000000) return res.status(422).json({
        msg:"image must be less than 5 MB"});
    file.mv(`./public/images/${fileName}`, async(err)=>{
        if(err) return res.status(500).json({
            msg: err.massage});
        try {
            await Product.create({
                name:name,
                Image:fileName,
                url:url
            })
            res.status(201).json({msg:"product created"})
        } catch (error) {
            console.log(error.massage)            
        }
    })

}

export const updateProduct=async(req,res)=>{
    const product = await Product.findOne({
        where: {
            id: req.params.id
        }
    });
    if(!product) return res.status(404).json({msg:"No Data Found"});
    let fileName="";
    // if no new file
    if(req.files === null){
        fileName = Product.Image;
    }else{
        //upload new file
        const file = req.files.file;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        fileName = file.md5 + ext; 
        const allowedType =['.png','.jpg','jpeg'];

        if(!allowedType.includes(ext.toLocaleLowerCase())) return res.status(422).json({
            msg:"invalid image type"});
        if(fileSize>5000000) return res.status(422).json({
            msg:"image must be less than 5 MB"});

        //delete previous image
        const filePath = `./public/images/${product.Image}`;
        fs.unlinkSync(filePath);
        
        //save new image
        file.mv(`./public/images/${fileName}`, (err)=>{
            if(err) return res.status(500).json({msg: err.massage});
        })
    }

    //update to database
    const name =req.body.title;
    const url =`${req.protocol}://${req.get("host")}/images/${fileName}`;
    try {
        await Product.update({
            name: name,
            Image: fileName,
            url: url
        },{
            where: {
                id: req.params.id
            }
        })
        res.status(200).json({msg:"Product Updated"})
    } catch (error) {
        console.log(error.massage)
    }
    
}

export const deleteProduct=async(req,res)=>{
    const product = await Product.findOne({
        where: {
            id: req.params.id
        }
    });
    if(!product) return res.status(404).json({msg:"No Data Found"});

    try {
        const filePath = `./public/images/${product.Image}`;
        fs.unlinkSync(filePath);
        await Product.destroy({
            where: {
                id: req.params.id
            }
        })
        res.status(400).json({msg:"Product Deleted"});
    } catch (error) {
        console.log(error.massage);
    }
}

