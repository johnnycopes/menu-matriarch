import { Injectable } from '@angular/core';

import { Endpoint } from '@models/endpoint.enum';
import { createDishDto, createMealDto, createMenuDto, createTagDto, createUserDto } from '@utility/domain/create-dtos';
import { BatchService } from './internal/batch.service';
import { DataService } from './internal/data.service';

@Injectable({
  providedIn: 'root'
})
export class SeedDataService {

  constructor(
    private _batchService: BatchService,
    private _dataService: DataService,
  ) { }

  public async createUserData({ uid, name, email }: {
    uid: string,
    name: string,
    email: string,
  }): Promise<string> {
    const menuId = this._dataService.createId();
    const southernClassicMealId = this._dataService.createId();
    const sushiDinnerMealId = this._dataService.createId();
    const cornbreadDishId = this._dataService.createId();
    const enchiladasDishId = this._dataService.createId();
    const friedChickenDishId = this._dataService.createId();
    const greekSaladDishId = this._dataService.createId();
    const macAndCheeseDishId = this._dataService.createId();
    const misoSoupDishId = this._dataService.createId();
    const pizzaDishId = this._dataService.createId();
    const redLentilSoupDishId = this._dataService.createId();
    const roastedCauliflowerDishId = this._dataService.createId();
    const salmonBurgersDishId = this._dataService.createId();
    const sushiDishId = this._dataService.createId();
    const sweetPotatoFriesDishId = this._dataService.createId();
    const tiramisuDishId = this._dataService.createId();
    const thaiCurryDishId = this._dataService.createId();
    const easyTagId = this._dataService.createId();
    const pescatarianTagId = this._dataService.createId();
    const veganTagId = this._dataService.createId();
    const vegetarianTagId = this._dataService.createId();
    const batch = this._batchService.createBatch();
    batch
      .set({
        endpoint: Endpoint.users,
        id: uid,
        data: createUserDto({ uid, name, email }),
      })
      .set({
        endpoint: Endpoint.menus,
        id: menuId,
        data: createMenuDto({ id: menuId, uid, name: 'Menu #1', contents: {
          Monday: [enchiladasDishId],
          Tuesday: [sushiDishId, misoSoupDishId],
          Wednesday: [salmonBurgersDishId, sweetPotatoFriesDishId],
          Thursday: [redLentilSoupDishId],
          Friday: [pizzaDishId, tiramisuDishId],
          Saturday: [thaiCurryDishId, tiramisuDishId],
          Sunday: [friedChickenDishId, cornbreadDishId, macAndCheeseDishId],
        }}),
      })
      .set({
        endpoint: Endpoint.meals,
        id: southernClassicMealId,
        data: createMealDto({
          id: southernClassicMealId,
          uid,
          name: 'Southern Classic',
          dishes: [cornbreadDishId, friedChickenDishId, macAndCheeseDishId],
        })
      })
      .set({
        endpoint: Endpoint.meals,
        id: sushiDinnerMealId,
        data: createMealDto({
          id: sushiDinnerMealId,
          uid,
          name: 'Sushi Dinner',
          dishes: [sushiDishId, misoSoupDishId],
          tags: [pescatarianTagId],
        })
      })
      .set({
        endpoint: Endpoint.dishes,
        id: cornbreadDishId,
        data: createDishDto({
          id: cornbreadDishId,
          uid,
          name: 'Cornbread',
          description: 'Made in the skillet with brown butter',
          type: 'side',
          link: 'https://cooking.nytimes.com/recipes/1016965-brown-butter-skillet-cornbread',
          menus: [menuId],
          meals: [southernClassicMealId],
          tags: [vegetarianTagId],
          usages: 1,
        })
      })
      .set({
        endpoint: Endpoint.dishes,
        id: enchiladasDishId,
        data: createDishDto({
          id: enchiladasDishId,
          uid,
          name: 'Enchiladas',
          link: 'https://cooking.nytimes.com/recipes/1018152-enchiladas-con-carne',
          menus: [menuId],
          usages: 1,
        })
      })
      .set({
        endpoint: Endpoint.dishes,
        id: friedChickenDishId,
        data: createDishDto({
          id: friedChickenDishId,
          uid,
          name: 'Fried Chicken',
          link: 'https://cooking.nytimes.com/recipes/1018219-buttermilk-fried-chicken',
          menus: [menuId],
          meals: [southernClassicMealId],
          usages: 1,
        })
      })
      .set({
        endpoint: Endpoint.dishes,
        id: greekSaladDishId,
        data: createDishDto({
          id: greekSaladDishId,
          uid,
          name: 'Greek Salad',
          tags: [vegetarianTagId],
        })
      })
      .set({
        endpoint: Endpoint.dishes,
        id: macAndCheeseDishId,
        data: createDishDto({
          id: macAndCheeseDishId,
          uid,
          name: 'Macaroni and Cheese',
          description: 'Delicious baked noodles from the USA',
          type: 'side',
          link: 'https://cooking.nytimes.com/recipes/1015825-creamy-macaroni-and-cheese',
          menus: [menuId],
          meals: [southernClassicMealId],
          tags: [vegetarianTagId],
          usages: 1,
        })
      })
      .set({
        endpoint: Endpoint.dishes,
        id: misoSoupDishId,
        data: createDishDto({
          id: misoSoupDishId,
          uid,
          name: 'Miso Soup',
          type: 'side',
          menus: [menuId],
          meals: [sushiDinnerMealId],
          tags: [veganTagId, vegetarianTagId],
          usages: 1,
        })
      })
      .set({
        endpoint: Endpoint.dishes,
        id: pizzaDishId,
        data: createDishDto({
          id: pizzaDishId,
          uid,
          name: 'Pizza',
          description: 'Delicious round vessel from Italy',
          link: 'https://cooking.nytimes.com/guides/1-how-to-make-pizza',
          menus: [menuId],
          tags: [vegetarianTagId],
          usages: 1,
        })
      })
      .set({
        endpoint: Endpoint.dishes,
        id: redLentilSoupDishId,
        data: createDishDto({
          id: redLentilSoupDishId,
          uid,
          name: 'Red Lentil Soup',
          link: 'https://cooking.nytimes.com/recipes/1016062-red-lentil-soup-with-lemon',
          menus: [menuId],
          tags: [veganTagId, vegetarianTagId],
          usages: 1,
        })
      })
      .set({
        endpoint: Endpoint.dishes,
        id: roastedCauliflowerDishId,
        data: createDishDto({
          id: roastedCauliflowerDishId,
          uid,
          name: 'Roasted Cauliflower',
          link: 'https://cooking.nytimes.com/recipes/7588-roasted-cauliflower',
          type: 'side',
          tags: [easyTagId, veganTagId, vegetarianTagId],
        })
      })
      .set({
        endpoint: Endpoint.dishes,
        id: salmonBurgersDishId,
        data: createDishDto({
          id: salmonBurgersDishId,
          uid,
          name: 'Salmon Burgers',
          link: 'https://cooking.nytimes.com/recipes/7131-salmon-burgers',
          menus: [menuId],
          tags: [pescatarianTagId],
          usages: 1,
        }),
      })
      .set({
        endpoint: Endpoint.dishes,
        id: sushiDishId,
        data: createDishDto({
          id: sushiDishId,
          uid,
          name: 'Sushi',
          description: 'Delicious tiny vessels from Japan',
          menus: [menuId],
          meals: [sushiDinnerMealId],
          tags: [pescatarianTagId],
          usages: 1,
        }),
      })
      .set({
        endpoint: Endpoint.dishes,
        id: sweetPotatoFriesDishId,
        data: createDishDto({
          id: sweetPotatoFriesDishId,
          uid,
          name: 'Sweet Potato Fries',
          type: 'side',
          menus: [menuId],
          tags: [veganTagId, vegetarianTagId],
          usages: 1,
        }),
      })
      .set({
        endpoint: Endpoint.dishes,
        id: tiramisuDishId,
        data: createDishDto({
          id: tiramisuDishId,
          uid,
          name: 'Tiramisu',
          description: 'Delicious coffee-flavored Italian cake',
          link: 'https://cooking.nytimes.com/recipes/1018684-classic-tiramisu',
          type: 'dessert',
          menus: [menuId],
          tags: [],
          usages: 2,
        }),
      })
      .set({
        endpoint: Endpoint.dishes,
        id: thaiCurryDishId,
        data: createDishDto({
          id: thaiCurryDishId,
          uid,
          name: 'Thai Curry',
          description: 'Delicious fragrant stew from Thailand',
          link: 'https://cooking.nytimes.com/recipes/1015694-vegan-thai-curry-vegetables',
          menus: [menuId],
          tags: [easyTagId, veganTagId, vegetarianTagId],
          usages: 1,
        }),
      })
      .set({
        endpoint: Endpoint.tags,
        id: easyTagId,
        data: createTagDto({
          id: easyTagId,
          uid,
          name: 'Easy',
          dishes: [roastedCauliflowerDishId, thaiCurryDishId]
        }),
      })
      .set({
        endpoint: Endpoint.tags,
        id: pescatarianTagId,
        data: createTagDto({
          id: pescatarianTagId,
          uid,
          name: 'Pescatarian',
          dishes: [salmonBurgersDishId, sushiDishId],
          meals: [sushiDinnerMealId],
        }),
      })
      .set({
        endpoint: Endpoint.tags,
        id: veganTagId,
        data: createTagDto({ id: veganTagId, uid, name: 'Vegan', dishes: [
          misoSoupDishId,
          redLentilSoupDishId,
          roastedCauliflowerDishId,
          sweetPotatoFriesDishId,
          thaiCurryDishId
        ]}),
      })
      .set({
        endpoint: Endpoint.tags,
        id: vegetarianTagId,
        data: createTagDto({ id: vegetarianTagId, uid, name: 'Vegetarian', dishes: [
          cornbreadDishId,
          greekSaladDishId,
          macAndCheeseDishId,
          misoSoupDishId,
          pizzaDishId,
          redLentilSoupDishId,
          roastedCauliflowerDishId,
          sweetPotatoFriesDishId,
          thaiCurryDishId
        ]}),
      });
    await batch.commit();
    return menuId;
  }
}
