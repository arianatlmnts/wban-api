const usersCtrl = {};
const request = require('got');
const User = require('../models/User');
const Module = require('../models/Module');
const Input = require('../models/Input');
const Output = require('../models/Output');

//-------------- /users
usersCtrl.getUsers = async (req,res) => {
    const users = await User.find().populate('modules').populate('inputs');
    res.json(users);
};

usersCtrl.createUser = async (req,res) => {
    const { name, gender, age, language, interests, location } = req.body;
    const newUser = new User({
        name: name,
        gender: gender,
        age: age,
        language: language,
        interests: interests,
        location: location
    });

    // modules are added separately

    newUser.location.type = "Point";
    newUser.location.time = new Date();

    await newUser.save();
    res.json({message:"User Saved"});

    console.log("User saved")
};


//-------------- /users/id
usersCtrl.getUser = async (req,res) => {
    const user = await User.findById(req.params.id).populate('modules').then((user)=>{
        res.json(user);
    }).catch((error)=>{
        res.status(404);
        res.json("User with id "+req.params.id+" does not exist");
    });
};

usersCtrl.updateUser = async (req,res) => {
    const { name, gender, age, language, interests, location, modules } = req.body;

    const user = await User.findById(req.params.id).then(async (user)=>{
        await User.findOneAndUpdate({_id:req.params.id}, {
            name,
            gender,
            age,
            language,
            interests,
            location,
            modules
        },{
            omitUndefined: true,
            new: true
        });

        if(location){
            const user = await User.findById(req.params.id);
            user.location.type = "Point";
            user.location.time = new Date();
            user.save();
            console.log('New location for user '+req.params.id+'\n coordinates: '+user.location.coordinates);
        }

        res.json("User with id "+req.params.id+" updated");

    }).catch((error)=>{
        res.status(404);
        res.json("User with id "+req.params.id+" does not exist");
    });

    // res.json({message:"User with id "+req.params.id+" updated"});
};

usersCtrl.deleteUser = async (req,res) => {
    const user = await User.findById(req.params.id).then(async (user)=>{
        await User.findByIdAndDelete(req.params.id);
        res.json({message:'User Deleted'});
    }).catch((error)=>{
        res.status(404);
        res.json("User with id "+req.params.id+" does not exist");
    });
};


//-------------- /users/id/modules
usersCtrl.getModules = async (req,res) => {
    const user = await User.findById(req.params.id).populate('modules').then(async (user)=>{
        // user.modules.populate('inputs'); // FIX...
        res.json(user.modules);
    }).catch((error)=>{
        res.status(404);
        res.json("User with id "+req.params.id+" does not exist");
    });
};

usersCtrl.createModule = async (req,res) => {
    const { name, description, body_location, inputs, outputs } = req.body;

    const newModule = new Module({
        name: name,
        description: description,
        body_location: body_location,
        inputs: inputs,
        outputs: outputs
    });

    const user = await User.findById(req.params.id).then(async (user)=>{
        newModule.user = user;
        await newModule.save();
        user.modules.push(newModule);
        await user.save();
        console.log("New module ("+newModule._id+") added to user "+req.params.id);
        res.json("New module ("+newModule._id+") added to user "+req.params.id);
    }).catch((error)=>{
        res.status(404);
        res.json("User with id "+req.params.id+" does not exist");
    });
};


//-------------- /users/id/modules/module_id
usersCtrl.getModule = async (req,res)=>{
    const user = await User.findById(req.params.id).then(async (user)=>{
        const modulo = await Module.findById(req.params.module_id).populate('inputs').populate('outputs').then(async (modulo)=>{
            res.json(modulo);
        }).catch((error)=>{
            res.status(404);
            res.json("Module "+req.params.module_id+" in user "+req.params.id+" does not exist");
        });
    }).catch((error)=>{
        res.status(404);
        res.json("User with id "+req.params.id+" does not exist");
    });
};

usersCtrl.updateModule = async (req,res)=> {
    const { name, description, body_location, inputs, outputs } = req.body;
    const user = await User.findById(req.params.id).then(async (user)=>{
        const modulo = await Module.findById(req.params.module_id).then(async (modulo)=>{
            await Module.findOneAndUpdate({_id:req.params.module_id}, {
                name,
                description,
                body_location,
                inputs,
                outputs
            },{
                omitUndefined: true,
                new: true
            });
            res.json({message:"Module with id "+req.params.module_id+" updated"});
        }).catch((error)=>{
            res.status(404);
            res.json("Module "+req.params.module_id+" in user "+req.params.id+" does not exist");
        });
    }).catch((error)=>{
        res.status(404);
        res.json("User with id "+req.params.id+" does not exist");
    });
};

usersCtrl.deleteModule = async (req,res)=> {
    const user = await User.findById(req.params.id).then(async (user)=>{
        const modulo = await Module.findById(req.params.module_id).then(async (modulo)=>{
            await Module.findByIdAndDelete(req.params.module_id);
            res.json({message:'Module does not exist'});
        }).catch((error)=>{
            res.status(404);
            res.json("Module "+req.params.module_id+" in user "+req.params.id+" does not exist");
        });
    }).catch((error)=>{
        res.status(404);
        res.json("User with id "+req.params.id+" does not exist");
    });
};


//-------------- /users/id/modules/module_id/inputs
usersCtrl.getInputs = async (req,res)=>{
    const user = await User.findById(req.params.id).then(async (user)=>{
        const modulo = await Module.findById(req.params.module_id).populate('inputs').then(async (modulo)=>{
            res.json(modulo.inputs);
        }).catch((error)=>{
            res.status(404);
            res.json("Module "+req.params.module_id+" in user "+req.params.id+" does not exist");
        });
    }).catch((error)=>{
        res.status(404);
        res.json("User with id "+req.params.id+" does not exist");
    });
};
usersCtrl.createInput = async (req,res)=>{
    const { name, status, type, units, min_value, max_value } = req.body;
    const newInput = new Input({
        name: name,
        status: status,
        type: type,
        units: units,
        min_value: min_value,
        max_value: max_value,
    });

    // input values added separately (in updateInput)

    const user = await User.findById(req.params.id).then(async (user)=>{
        const modulo = await Module.findById(req.params.module_id).then(async (modulo)=>{
            newInput.modulo = modulo;
            await newInput.save();

            modulo.inputs.push(newInput);
            await modulo.save();

            res.json("Input added to user "+req.params.id+", module "+req.params.module_id);

        }).catch((error)=>{
            res.status(404);
            res.json("Module "+req.params.module_id+" in user "+req.params.id+" does not exist");
        });
    }).catch((error)=>{
        res.status(404);
        res.json("User with id "+req.params.id+" does not exist");
    });
};


//-------------- /users/id/modules/module_id/outputs
usersCtrl.getOutputs = async (req,res)=>{
    const user = await User.findById(req.params.id).then(async (user)=>{
        const modulo = await Module.findById(req.params.module_id).populate('outputs').then(async (modulo)=>{
            res.json(modulo.outputs);
        }).catch((error)=>{
            res.status(404);
            res.json("Module "+req.params.module_id+" in user "+req.params.id+" does not exist");
        });
    }).catch((error)=>{
        res.status(404);
        res.json("User with id "+req.params.id+" does not exist");
    });
};
usersCtrl.createOutput = async (req,res)=>{
    const { name, status, type, units, min_value, max_value, value } = req.body;
    const newOutput = new Output({
        name: name,
        status: status,
        type: type,
        units: units,
        min_value: min_value,
        max_value: max_value,
        value: value
    });

    const user = await User.findById(req.params.id).then(async (user)=>{
        const modulo = await Module.findById(req.params.module_id).populate('outputs').then(async (modulo)=>{
            newOutput.modulo = modulo;
            await newOutput.save();

            modulo.outputs.push(newOutput);
            await modulo.save();

            res.json("Output added to user "+req.params.id+", module "+req.params.module_id);

        }).catch((error)=>{
            res.status(404);
            res.json("Module "+req.params.module_id+" in user "+req.params.id+" does not exist");
        });
    }).catch((error)=>{
        res.status(404);
        res.json("User with id "+req.params.id+" does not exist");
    });
};


//-------------- /users/id/modules/module_id/inputs/input_id
usersCtrl.getInput = async (req,res)=>{
    const user = await User.findById(req.params.id).then(async (user)=>{
        const modulo = await Module.findById(req.params.module_id).then(async (modulo)=>{
            const input = await Input.findById(req.params.input_id).then(async (input)=>{
                res.json(input);
            }).catch((error)=>{
                res.status(404);
                res.json("Input "+req.params.input_id+" in module "+req.params.module_id+" does not exist");
            });
        }).catch((error)=>{
            res.status(404);
            res.json("Module "+req.params.module_id+" in user "+req.params.id+" does not exist");
        });
    }).catch((error)=>{
        res.status(404);
        res.json("User with id "+req.params.id+" does not exist");
    });
};

usersCtrl.updateInput = async (req,res)=>{
    const { name, status, type, units, min_value, max_value, value } = req.body;
    const user = await User.findById(req.params.id).then(async (user)=>{
        const modulo = await Module.findById(req.params.module_id).then(async (modulo)=>{
            const input = await Input.findById(req.params.input_id).then(async (input)=>{
                await Input.findOneAndUpdate({_id:req.params.input_id}, {
                    name: name,
                    status: status,
                    type: type,
                    units: units,
                    min_value: min_value,
                    max_value: max_value,
                },{
                    omitUndefined: true,
                    new: true
                });

                if(value){
                    const input = await Input.findById(req.params.input_id);

                    var newData = new Object();
                    newData.value = value;
                    newData.time = new Date();
                    var jsonString= JSON.stringify(newData);

                    if(input.data.length == 20) input.data.shift();

                    input.data.push(newData);
                    input.save();

                    console.log("Data added to input \""+input.name+"\":\n {value: "+input.data[input.data.length-1].value+", time: "+input.data[input.data.length-1].time+"}");
                }
                res.json({message:"Input with id "+req.params.input_id+" updated"});

            }).catch((error)=>{
                res.status(404);
                res.json("Input "+req.params.input_id+" in module "+req.params.module_id+" does not exist");
            });
        }).catch((error)=>{
            res.status(404);
            res.json("Module "+req.params.module_id+" in user "+req.params.id+" does not exist");
        });
    }).catch((error)=>{
        res.status(404);
        res.json("User with id "+req.params.id+" does not exist");
    });
};

usersCtrl.deleteInput = async (req,res)=>{
    const user = await User.findById(req.params.id).then(async (user)=>{
        const modulo = await Module.findById(req.params.module_id).then(async (modulo)=>{
            const input = await Input.findById(req.params.input_id).then(async (input)=>{
                await Input.findByIdAndDelete(req.params.input_id);
                res.json({message:'Input Deleted'});
            }).catch((error)=>{
                res.status(404);
                res.json("Input "+req.params.input_id+" in module "+req.params.module_id+" does not exist");
            });
        }).catch((error)=>{
            res.status(404);
            res.json("Module "+req.params.module_id+" in user "+req.params.id+" does not exist");
        });
    }).catch((error)=>{
        res.status(404);
        res.json("User with id "+req.params.id+" does not exist");
    });
};

//-------------- /users/id/modules/module_id/outputs/output_id
usersCtrl.getOutput = async (req,res)=>{
    const user = await User.findById(req.params.id).then(async (user)=>{
        const modulo = await Module.findById(req.params.module_id).then(async (modulo)=>{
            const output = await Output.findById(req.params.output_id).then(async (output)=>{
                res.json(output);
            }).catch((error)=>{
                res.status(404);
                res.json("Output "+req.params.output_id+" in module "+req.params.module_id+" does not exist");
            });
        }).catch((error)=>{
            res.status(404);
            res.json("Module "+req.params.module_id+" in user "+req.params.id+" does not exist");
        });
    }).catch((error)=>{
        res.status(404);
        res.json("User with id "+req.params.id+" does not exist");
    });
};

usersCtrl.updateOutput = async (req,res)=>{
    const { name, status, type, units, min_value, max_value, value } = req.body;
    const user = await User.findById(req.params.id).then(async (user)=>{
        const modulo = await Module.findById(req.params.module_id).then(async (modulo)=>{
            const output = await Output.findById(req.params.output_id).then(async (output)=>{
                await Output.findOneAndUpdate({_id:req.params.output_id}, {
                    name: name,
                    status: status,
                    type: type,
                    units: units,
                    min_value: min_value,
                    max_value: max_value,
                    value: value
                },{
                    omitUndefined: true,
                    new: true
                });

                res.json({message:"Output with id "+req.params.output_id+" updated"});
            }).catch((error)=>{
                res.status(404);
                res.json("Output "+req.params.output_id+" in module "+req.params.module_id+" does not exist");
            });
        }).catch((error)=>{
            res.status(404);
            res.json("Module "+req.params.module_id+" in user "+req.params.id+" does not exist");
        });
    }).catch((error)=>{
        res.status(404);
        res.json("User with id "+req.params.id+" does not exist");
    });
};

usersCtrl.deleteOutput = async (req,res)=>{
    const user = await User.findById(req.params.id).then(async (user)=>{
        const modulo = await Module.findById(req.params.module_id).then(async (modulo)=>{
            const output = await Output.findById(req.params.output_id).then(async (output)=>{
                await Output.findByIdAndDelete(req.params.output_id);
                res.json({message:'Output Deleted'});
            }).catch((error)=>{
                res.status(404);
                res.json("Output "+req.params.input_id+" in module "+req.params.module_id+" does not exist");
            });
        }).catch((error)=>{
            res.status(404);
            res.json("Module "+req.params.module_id+" in user "+req.params.id+" does not exist");
        });
    }).catch((error)=>{
        res.status(404);
        res.json("User with id "+req.params.id+" does not exist");
    });
};

//-------------- /users/id/nearby
usersCtrl.getNearby = async (req,res)=>{
    const user = await User.findById(req.params.id);
    const key = 'AIzaSyAMSJCzD-eR0vjQPwrXARRftT60tljIsl4';

    var latitude = user.location.coordinates[0],
        longitude = user.location.coordinates[1],
        language = user.language,
        interests = user.interests,
        rad = 100;

    var nearby_places = new Object();

    nearby_places.from_coordinates = user.location.coordinates;
    nearby_places.radius = rad;

    for (var i = 0; i < interests.length; i++) {
        interest = interests[i].slice(0,-1);
        try {
            console.log('Getting nearby '+interests[i]+'...')
            const response = await request('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+latitude+','+longitude+'&radius='+rad+'&type='+interest+'&key='+key);
            var body = JSON.parse(response.body);

            total = body.results.length;
            console.log(total +' '+interests[i]);

            var result = []

            for (var j = 0; j < total; j++) {

                var place_id = body.results[j].place_id;

                try {
                    const response_routes = await request('https://maps.googleapis.com/maps/api/directions/json?origin='+latitude+','+longitude+'&destination=place_id:'+place_id+'&mode=walking&language='+language+'&key='+key);

                    var body_routes = JSON.parse(response_routes.body);

                } catch (error) {
                    console.log(error.response_routes);
                }

                var object = new Object();

                object.name = body.results[j].name;
                object.location = body.results[j].geometry.location;
                object.total_distance = body_routes.routes[0].legs[0].distance;
                object.walking_duration = body_routes.routes[0].legs[0].duration;
                object.directions = body_routes.routes[0].legs[0].steps;

                if (body.results[j].geometry.opening_hours){
                    console.log(body.results[j].geometry.opening_hours);
                };

                result.push(object);

                if (j == total-1){
                    nearby_places[interests[i]] = new Object();
                    nearby_places[interests[i]].total_results = total;
                    nearby_places[interests[i]].results = result;
                }
            }

        } catch (error) {
            console.log(error.response);
        }
    }

    console.log(nearby_places);
    res.json(nearby_places);
};

module.exports = usersCtrl;
