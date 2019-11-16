const { Router } = require('express');
const router = Router();
const { getUsers, createUser, getUser, updateUser, deleteUser, getModules, createModule, getModule, updateModule, deleteModule, getInputs, createInput, getInput, updateInput, deleteInput, getOutputs, createOutput,  getOutput, updateOutput, deleteOutput, getNearby } = require('../controllers/users.controller');

router.route('/')
        .get(getUsers)
        .post(createUser)

router.route('/:id')
        .get(getUser)
        .put(updateUser)
        .delete(deleteUser)

router.route('/:id/modules')
        .get(getModules)
        .post(createModule)

router.route('/:id/modules/:module_id')
        .get(getModule)
        .put(updateModule)
        .delete(deleteModule)

router.route('/:id/modules/:module_id/inputs')
        .get(getInputs)
        .post(createInput)

router.route('/:id/modules/:module_id/outputs')
        .get(getOutputs)
        .post(createOutput)

router.route('/:id/modules/:module_id/inputs/:input_id')
        .get(getInput)
        .put(updateInput)
        .delete(deleteInput)

router.route('/:id/modules/:module_id/outputs/:output_id')
        .get(getOutput)
        .put(updateOutput)
        .delete(deleteOutput)

router.route('/:id/nearby')
        .get(getNearby)

module.exports = router;
