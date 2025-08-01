import { describe, it, expect } from 'vitest';
import app from '../app';

describe('Test APIs', () => {
  it('return all profiles', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/profiles',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toBeInstanceOf(Array);
    console.log(response.json())
    expect(response.json().length).toEqual(2);
    expect(response.json()[1]).toHaveProperty('firstname');
    expect(response.json()[1]).toHaveProperty('firstname', 'Lekha');
  });

  it('return a profile by lastName', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/profileByLastName/John',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(
      expect.objectContaining({
        pid: 'EJohn19800502',
        firstname: 'Emma',
        lastname: 'John',
        dateofbirth: '1980-05-02'
      })
    );
  });

  it('return a profile by dob', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/profileByDob/1980-05-02',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(
      expect.objectContaining({
        pid: 'EJohn19800502',
        firstname: 'Emma',
        lastname: 'John',
        dateofbirth: '1980-05-02'
      })
    );
  });

  it('return a profile by pid', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/profileById/EJohn19800502',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(
      expect.objectContaining({
        pid: 'EJohn19800502',
        firstname: 'Emma',
        lastname: 'John',
        dateofbirth: '1980-05-02'
      })
    );
  });

  it('user profile not found', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/profile/Gregg',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().message).toEqual("Route GET:/profile/Gregg not found");
  });

  it('profile already exists', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/profile',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({        
        firstName: 'Emma',
        lastName: 'John',
        dateOfBirth: '1980-05-02'
      })
    });

    expect(response.statusCode).toBe(409);
    expect(response.json().error).toEqual("A profile with same name and date of birth already exists.");
  });

  it('profile updated', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: '/profile/EJohn19800502',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({        
        lastName: 'Philips',
      })
    });

    expect(response.statusCode).toBe(204);
  });
});
