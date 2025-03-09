import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';
const BASE_URL_LOCAL = 'http://localhost:3001';

export const apiService = {
  // Versions
  getVersions: async () => {
    const response = await axios.get(`${BASE_URL}/versions`);
    return response;
  },

  syncVersions: async () => {
    const response = await axios.get(`${BASE_URL}/sync`);
    return response;
  },

  // Issues
  getIssuePhotos: async (issueId: number) => {
    const response = await axios.get(`${BASE_URL}/issues/${issueId}/photos`);
    return response;
  },

  addPhotosToIssue: async (issueId: number, photos: File[]) => {
    const formData = new FormData();
    photos.forEach((file) => {
      formData.append('photos', file);
    });

    const response = await axios.post(
      `${BASE_URL}/issues/${issueId}/addphotos`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response;
  },

  addResolution: async (issueId: number, resolution: string) => {
    const response = await axios.post(`${BASE_URL}/issues/${issueId}/addresolution`, {
      resolution
    } , {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response;
  },

  addWorkaround: async (issueId: number, workaround: string) => {
    const response = await axios.post(`${BASE_URL}/issues/${issueId}/addworkaround`, {
      workaround
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response;
  },

  // Subscriptions
  subscribe: async (subscriptionData: {
    vendor: string;
    email: string;
    product: string;
    Unit_of_time: string;
    Frequency: number;
  }) => {
    const response = await axios.post(`${BASE_URL}/subscribe`, subscriptionData);
    return response;
  },

  // Reports
  submitReport: (formData: FormData) => {
    return axios.post(`${BASE_URL}/issues/report`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  photoUrl: (photo: string) => {
    return `${BASE_URL_LOCAL}` + '/'+ photo;
  }

};