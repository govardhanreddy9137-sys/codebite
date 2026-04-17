db.foods.find({image: {$regex: '^src/images/'}}).forEach(f => {
    db.foods.updateOne({_id: f._id}, {$set: {image: '/' + f.image}});
});
db.restaurants.find({image: {$regex: '^src/images/'}}).forEach(r => {
    db.restaurants.updateOne({_id: r._id}, {$set: {image: '/' + r.image}});
});
print('Image paths updated successfully');
