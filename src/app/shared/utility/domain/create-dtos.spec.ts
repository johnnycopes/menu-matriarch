import { MenuDto } from "@models/dtos/menu-dto.interface";
import { createMenuDto, createUserDto } from "./create-dtos";

describe('create dtos', () => {
  describe('create user', () => {
    it('creates default user when no arguments are passed in', () => {
      const user = createUserDto({});
      expect(user).toEqual({
        uid: '', name: '', email: '', preferences: {
          darkMode: false, dayNameDisplay: 'full', defaultMenuStartDay: 'Monday', emptyMealText: 'undecided', mealOrientation: 'horizontal'
        }
      });
    });

    it('creates user when arguments are passed in', () => {
      const user = createUserDto({
        uid: '1',
        email: 'fake@fake.com',
        name: 'Bob',
        preferences: {
          darkMode: true,
          dayNameDisplay: 'full',
          defaultMenuStartDay: 'Wednesday',
          emptyMealText: 'nothing',
          mealOrientation: 'vertical'
        },
      });
      expect(user).toEqual({
        uid: '1',
        email: 'fake@fake.com',
        name: 'Bob',
        preferences: {
          darkMode: true,
          dayNameDisplay: 'full',
          defaultMenuStartDay: 'Wednesday',
          emptyMealText: 'nothing',
          mealOrientation: 'vertical'
        },
      });
    });
  });

  describe('create menu', () => {
    it('creates default menu when no arguments are passed in', () => {
      const menu = createMenuDto({});
      expect(menu).toEqual({
        contents: {
          Friday: [],
          Monday: [],
          Saturday: [],
          Sunday: [],
          Thursday: [],
          Tuesday: [],
          Wednesday: [],
        },
        favorited: false,
        id: '',
        name: '',
        startDay: 'Monday',
        uid: '',
      });
    });

    it('creates menu when arguments are passed in', () => {
      const menu = createMenuDto({
        id: '1',
        uid: 'A2',
        name: 'Bob',
        favorited: true,
        startDay: 'Saturday',
        contents: {
          Monday: [], Tuesday: ['1'], Wednesday: [], Thursday: ['2'], Friday: [], Saturday: [], Sunday: ['3']
        },
      });
      expect(menu).toEqual({
        id: '1',
        uid: 'A2',
        name: 'Bob',
        favorited: true,
        startDay: 'Saturday',
        contents: {
          Monday: [], Tuesday: ['1'], Wednesday: [], Thursday: ['2'], Friday: [], Saturday: [], Sunday: ['3'],
        }
      } as MenuDto);
    });
  });
});
