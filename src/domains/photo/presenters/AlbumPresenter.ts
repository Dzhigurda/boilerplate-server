import { UserPresenter } from "../../user/UserPresenter";
import { Album } from "../album/Album";
import { PhotoReposioryExport } from "../photo/PhotoRepository";
import { PhotoPresenter } from "./PhotoPresenter";

export class AlbumPresenter {
  constructor(
    private photoRepository: PhotoReposioryExport,
    private photoPresenter: PhotoPresenter,
    private user: UserPresenter
  ) {}

  getFullAlbum(album: Album) {
    const photo = this.photoRepository.getByAlbum(album.getId());
    photo.sort((l, r) => l.getSort() - r.getSort());
    const userRef = album.getOwner() ? this.user.getUserTumbanian(album.getOwner()) : undefined;
    return Object.assign(
      album.toJSON(),
      { photo: this.photoPresenter.mapPhoto(photo) },
      { userRef }
    );
  }

  mapFullAlbum(album: Album[]) {
    return album.map((a) => this.getFullAlbum(a));
  }

  getNanoAlbum(album: Album) {
    const photo = this.photoRepository.getByAlbum(album.getId());
    photo.sort((l, r) => l.getSort() - r.getSort());
    return {
      id: album.id,
      name: album.name,
      cover:
        photo.length > 0 ? this.photoPresenter.getPhoto(photo[0]) : undefined,
    };
  }

  mapNanoAlbum(album: Album[]) {
    return album.map((a) => this.getNanoAlbum(a));
  }
}
