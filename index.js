var express=require('express');
var app=express();
var mysql=require('mysql');
var bodyParser=require('body-parser');
var session =require('express-session');

app.use(function(req,res,next){
    res.set('Cache-Control','no-cache,private,must-revalidate,no-store');
    next();
});

app.use(session({
    secret:'secret',
    resave: true,
    saveUninitialized: true
}))
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

// create connection 
var con =mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"nodejs"
})
con.connect(function(err){
    if(err) throw err;
    console.log("connected ... ");
})

app.set('view engine','ejs');

app.get('/',function(req,res){
    res.render('signup');
});
// insert function
app.post('/signup',function(req,res){
    var nm=req.body.name;
    var age =req.body.age;
    var  sql =`INSERT INTO demo(name,age) VALUES ('${nm}','${age}')`;
    con.query(sql,function(err,results){
        if(err) throw err;
        res.send("inserted");
    });
});
//login function
app.get('/login',function(req,res){
    res.render('login');
});
app.post('/login',function(req,res){
    var nm=req.body.name;
    var age =req.body.age;
    if(nm && age){
        var sql = `select * from demo where name='${nm}' && age='${age}'`;
        con.query(sql,function(err,results){
            if(results.length>0){
                req.session.loggedin=true;
                req.session.name=nm;
                res.redirect('/show');
            }
            else{
                res.send("wrong name and age ");
            }
        });
    }
    else{
        res.send("invalid , enter name and age");
    }
});
//logout function
app.get('/logout',function(req,res){
    req.session.destroy((err)=>{
        res.redirect('/login');
    })
})
// display function 
app.get('/show',function(req,res){
    if(req.session.loggedin){
        //res.render('show',{user:`${req.session.name}`});
        var sql="select * from demo";
        con.query(sql,function(err,results){
            if(err) throw err;
            res.render('show',{demo:results});
        });    
    }
    else{
        res.send("<h1>Please login in first...</h1>");
    }

});
//edit function
app.get('/edit/:id',function(req,res){
    var id=req.params.id;
    var sql=`select * from demo where id='${id}'`;
    con.query(sql,function(err,results){
        if(err) throw err;
        res.render('edit',{demo:results});
    });
});
app.post('/update/:id',function(req,res){
    var id =req.params.id;
    var nm=req.body.name;
    var age =req.body.age;
    var sql =`update demo set name='${nm}',age='${age}' where id='${id}'`;
    con.query(sql,function(err){
        if(err) throw err;
        res.redirect('/show/?updated');
    });
});
// delete function
app.get('/delete/:id',function(req,res){
    var id =req.params.id;
    var sql = `delete from demo where id='${id}'`;
    con.query(sql,function(err){
        if(err) throw err;
        //res.send("info deleted");
        res.redirect('/show/?deleted');
    });
});


server=app.listen(4000)