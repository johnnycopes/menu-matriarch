import { UserDto } from "@models/dtos/user-dto.interface";
import { MenuDto } from "@models/dtos/menu-dto.interface";
import { MealDto } from "@models/dtos/meal-dto.interface";
import { DishDto } from "@models/dtos/dish-dto.interface";
import { TagDto } from "@models/dtos/tag-dto.interface";

export function createUserDto({ uid, name, email, preferences }: Partial<UserDto>): UserDto {
  return {
    uid: uid ?? '',
    name: name ?? '',
    email: email ?? '',
    preferences: {
      darkMode: preferences?.darkMode ?? false,
      dayNameDisplay: preferences?.dayNameDisplay ?? 'full',
      defaultMenuStartDay: preferences?.defaultMenuStartDay ?? 'Monday',
      emptyMealText: preferences?.emptyMealText ?? 'undecided',
      menuOrientation: preferences?.menuOrientation ?? 'horizontal',
    },
  }
}

export function createMenuDto({ id, uid, name, favorited, startDay, contents }: Partial<MenuDto>): MenuDto {
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

export function createMealDto(
  { id, uid, name, description, dishes, tags }: Partial<MealDto>
): MealDto {
  return {
    id: id ?? '',
    uid: uid ?? '',
    name: name ?? '',
    description: description ?? '',
    dishes: dishes ?? [],
    tags: tags ?? [],
  };
}

export function createDishDto(
  { id, uid, type, name, favorited, description, link, ingredients, meals, tags, notes, menus, usages }: Partial<DishDto>
): DishDto {
  return {
    id: id ?? '',
    uid: uid ?? '',
    type: type ?? 'main',
    name: name ?? '',
    favorited: favorited ?? false,
    description: description ?? '',
    link: link ?? '',
    ingredients: ingredients ?? [],
    meals: meals ?? [],
    tags: tags ?? [],
    notes: notes ?? '',
    menus: menus ?? [],
    usages: usages ?? 0,
  };
}

export function createTagDto({ id, uid, name, color, meals, dishes }: Partial<TagDto>): TagDto {
  return {
    id: id ?? '',
    uid: uid ?? '',
    name: name ?? '',
    color: color ?? '',
    meals: meals ?? [],
    dishes: dishes ?? [],
  };
}
