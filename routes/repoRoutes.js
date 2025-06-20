const express = require('express');
const router = express.Router();
const repoController = require('../controllers/repoController');

router.get('/repos', repoController.getRepos);
router.get('/repos/:id', repoController.getRepoById);
router.post('/repos', repoController.createRepo);
router.post('/repos/bulk', repoController.createBulkRepos); // New bulk create route
router.put('/repos/:id', repoController.updateRepo);
router.delete('/repos/:id', repoController.deleteRepo);
router.get('/categories-and-repos', repoController.getCategoriesAndRepos); // New combined route

module.exports = router;