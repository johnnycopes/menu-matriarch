const admin = require('firebase-admin');
const serviceAccount = require('../../firebase-admin-dev.json');
const uid = process.argv.slice(2)?.[0];

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

(async function(uid) {
  const db = admin.firestore();
  const batch = db.batch();

  const menu = createDocRef(db, 'menus');
  const sushiDinnerMeal = createDocRef(db, 'meals');
  const sushiDish = createDocRef(db, 'dishes');
  const misoSoupDish = createDocRef(db, 'dishes');
  const pescatarianTag = createDocRef(db, 'tags');
  const vegetarianTag = createDocRef(db, 'tags');

  batch.set(menu, createMenu({ id: menu.id, uid, name: 'Menu #1', contents: {
    Monday: [],
    Tuesday: [sushiDish.id, misoSoupDish.id],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  }}));
  batch.set(sushiDinnerMeal, createMeal({
    id: sushiDinnerMeal.id,
    uid,
    name: 'Sushi Dinner',
    dishIds: [sushiDish.id, misoSoupDish.id],
    tagIds: [pescatarianTag.id],
  }));
  batch.set(sushiDish, createDish({
    id: sushiDish.id,
    uid,
    name: 'Sushi',
    description: 'Delicious tiny vessels from Japan',
    menuIds: [menu.id],
    mealIds: [sushiDinnerMeal.id],
    tagIds: [pescatarianTag.id],
    usages: 1,
  }));
  batch.set(misoSoupDish, createDish({
    id: misoSoupDish.id,
    uid,
    name: 'Miso Soup',
    type: 'side',
    menuIds: [menu.id],
    mealIds: [sushiDinnerMeal.id],
    tagIds: [vegetarianTag.id],
    usages: 1,
  }));
  batch.set(pescatarianTag, createTag({
    id: pescatarianTag.id,
    name: 'Pescatarian',
    uid,
    mealIds: [sushiDinnerMeal.id],
    dishIds: [sushiDish.id],
  }));
  batch.set(vegetarianTag, createTag({
    id: vegetarianTag.id,
    name: 'Vegetarian',
    uid,
    dishIds: [misoSoupDish.id],
  }));

  await batch.commit();
})(uid);

function createDocRef(db, endpoint) {
  return db.collection(endpoint).doc();
}

function createMenu({ id, uid, name, favorited, startDay, contents }) {
  return {
    id: id ?? '',
    uid: uid ?? '',
    name: name ?? '',
    favorited: favorited ?? false,
    startDay: startDay ?? 'Monday',
    contents: contents ?? {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    },
  };
}

function createMeal({ id, uid, name, description, dishIds, tagIds }) {
  return {
    id: id ?? '',
    uid: uid ?? '',
    name: name ?? '',
    description: description ?? '',
    dishIds: dishIds ?? [],
    tagIds: tagIds ?? [],
  };
}

function createDish({ id, uid, type, name, favorited, description, link, notes, usages, menuIds, mealIds, ingredientIds, tagIds }) {
  return {
    id: id ?? '',
    uid: uid ?? '',
    type: type ?? 'main',
    name: name ?? '',
    favorited: favorited ?? false,
    description: description ?? '',
    link: link ?? '',
    notes: notes ?? '',
    usages: usages ?? 0,
    menuIds: menuIds ?? [],
    mealIds: mealIds ?? [],
    ingredientIds: ingredientIds ?? [],
    tagIds: tagIds ?? [],
  };
}

function createTag({ id, uid, name, color, mealIds, dishIds }) {
  return {
    id: id ?? '',
    uid: uid ?? '',
    name: name ?? '',
    color: color ?? '',
    mealIds: mealIds ?? [],
    dishIds: dishIds ?? [],
  };
};
