import { UserDto } from "./user-dto.interface";
import { MenuDto } from "./menu-dto.interface";
import { DishDto } from "./dish-dto.interface";
import { TagDto } from "./tag-dto.interface";

export function createUserDto({ uid, name, email, preferences }: Partial<UserDto>): UserDto {
  return {
    uid: uid ?? '',
    name: name ?? '',
    email: email ?? '',
    preferences: {
      darkMode: preferences?.darkMode ?? false,
      dayNameDisplay: preferences?.dayNameDisplay ?? 'full',
      emptyDishText: preferences?.emptyDishText ?? 'undecided',
      menuOrientation: preferences?.menuOrientation ?? 'horizontal',
      menuStartDay: preferences?.menuStartDay ?? 'Monday',
    },
  }
}

export function createMenuDto({ id, uid, name, favorited, contents }: Partial<MenuDto>): MenuDto {
  return {
    id: id ?? '',
    uid: uid ?? '',
    name: name ?? '',
    favorited: favorited ?? false,
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

export function createDishDto(
  { id, uid, type, name, favorited, description, link, ingredients, tags, notes, menus, usages }: Partial<DishDto>
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
    tags: tags ?? [],
    notes: notes ?? '',
    menus: menus ?? [],
    usages: usages ?? 0,
  };
}

export function createTagDto({ id, uid, name, color, dishes }: Partial<TagDto>): TagDto {
  return {
    id: id ?? '',
    uid: uid ?? '',
    name: name ?? '',
    color: color ?? '',
    dishes: dishes ?? [],
  };
}
