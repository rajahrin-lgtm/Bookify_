import { auth, storage } from "../firebaseConfig";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const updateUserProfile = async (displayName: string, photoFile?: File) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user logged in");

  let photoURL = user.photoURL;

  if (photoFile) {
    // Upload new avatar
    const storageRef = ref(storage, `avatars/${user.uid}_${Date.now()}`);
    const snapshot = await uploadBytes(storageRef, photoFile);
    photoURL = await getDownloadURL(snapshot.ref);
  }

  // Update Auth Profile
  await updateProfile(user, {
    displayName: displayName,
    photoURL: photoURL
  });

  return { displayName, photoURL };
};