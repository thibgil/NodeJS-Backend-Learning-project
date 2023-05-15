const UserModel = require('../models/user.model');
const ObjectID = require('mongoose').Types.ObjectId;

module.exports.getAllUsers = async (req, res) => {
    const users = await UserModel.find().select('-password');
    res.status(200).json(users);
}

module.exports.userInfo = async (req, res) => {
    console.log(req.params); // req.params = parameter passed in the URL
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send('ID unknown: ' + req.params.id);
  
    try {
      const docs = await UserModel.findById(req.params.id).select('-password');
      res.send(docs);
    } catch (err) {
      console.log('ID unknown: ' + err);
      res.status(500).send('Internal Server Error');
    }
};

module.exports.updateUser = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send('ID unknown: ' + req.params.id);
  
    try {
      const docs = await UserModel.findOneAndUpdate(
        { _id: req.params.id },
        {
          $set: {
            bio: req.body.bio,
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
  
      if (!docs) {
        return res.status(404).send('User not found');
      }
  
      return res.send(docs);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: err });
    }
};
  
module.exports.deleteUser = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send('ID unknown: ' + req.params.id);
  
    try {
      const result = await UserModel.deleteOne({ _id: req.params.id });
      if (result.deletedCount === 0) {
        return res.status(404).send('User not found');
      }
      return res.status(200).json({ message: 'Successfully deleted' });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: err });
    }
};
  
module.exports.follow = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send('ID unknown: ' + req.params.id);
  
    try {
      // Add to the follower list
      const user = await UserModel.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { following: req.body.idToFollow } },
        { new: true, upsert: true }
      );
  
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      // Add to the following list
      await UserModel.findByIdAndUpdate(
        req.body.idToFollow,
        { $addToSet: { followers: req.params.id } },
        { new: true, upsert: true }
      );
  
      res.status(201).json(user);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: err });
    }
};
  
  
module.exports.unfollow = async (req, res) => {
    if (
      !ObjectID.isValid(req.params.id) ||
      !ObjectID.isValid(req.body.idToUnfollow)
    )
      return res.status(400).send("ID unknown : " + req.params.id);
  
    try {
      // Remove from the follower list
      const user = await UserModel.findByIdAndUpdate(
        req.params.id,
        { $pull: { following: req.body.idToUnfollow } },
        { new: true, upsert: true }
      );
  
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      // Remove from the following list
      await UserModel.findByIdAndUpdate(
        req.body.idToUnfollow,
        { $pull: { followers: req.params.id } },
        { new: true, upsert: true }
      );
  
      res.status(201).json(user);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: err });
    }
};
  