import { Body, Controller, Get, Post, Sse } from '@nestjs/common';
import { UserCreateInput } from './dto/user-create.input';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { interval, map, Observable } from 'rxjs';

@Controller('users')
export class UserController {
  constructor(@InjectQueue('user') private queue: Queue) {}

  @Get('/')
  index() {
    return ['nestjs-graphql-bull-prisma-eventstore-playground'];
  }

  @Sse('sse')
  sse() {
    return interval(1000).pipe(map(_ => ({ data: { hello: 'world' } })));
  }

  /**
   * Registration.
   */
  @Post('users')
  async createUser(@Body() userCreateInput: UserCreateInput) {
    // const result = await this.service.createUser(request.body.user);
    // const firstError = result.errors?.[0]?.extensions?.data;
    // if (firstError) {
    //     throw firstError;
    // }
    // return result;
  }

  // /**
  //  * Authentication.
  //  */
  // @Post('users/login')
  // async postUsersLogin(@Req() request: Request) {
  //     return this.service.loginUser(request.body.user);
  // }

  // /**
  //  * Get current user.
  //  */
  // @Get('user')
  // async user(@AuthorizationToken() token: string) {
  //     return this.service.getCurrentUser(token);
  // }

  // /**
  //  * Update user.
  //  * Authentication required.
  //  */
  // @Put('user')
  // async updateUser(@AuthorizationToken() token: string, @Req() request: Request) {
  //     return this.service.updateUser({
  //         token,
  //         user: request.body.user,
  //     });
  // }

  // /**
  //  * Get user profile by name.
  //  * Authorization optional, if yes `following` property should be checked.
  //  */
  // @Get('profiles/:username')
  // async profilesUsername(
  //     @Param('username') name: string,
  //     @AuthorizationToken() token: string,
  // ) {
  //     return this.service.getProfile({
  //         token,
  //         name,
  //     });
  // }

  // /**
  //  * Create article, authentication required.
  //  */
  // @Post('articles')
  // @UseInterceptors(TagListInterceptor)
  // async createArticle(@Req() request: Request, @AuthorizationToken() token: string) {
  //     const createArticleDto: CreateArticleDto = request.body.article;
  //     // eslint-disable-next-line sonarjs/prefer-immediate-return
  //     const result = await this.service.createArticle({ token, createArticleDto });
  //     return result;
  // }

  // /**
  //  * Get all articles with optional filters.
  //  */
  // @Get('articles')
  // @UseInterceptors(TagListInterceptor)
  // async getArticles(
  //     @AuthorizationToken() token?: string,
  //     @Query() query?: GetArticlesDto,
  // ) {
  //     return this.service.getArticles({
  //         token,
  //         ...query,
  //     });
  // }

  // /**
  //  * Follow user, authentication required.
  //  */
  // @Post('profiles/:username/follow')
  // @HttpCode(200)
  // async followUser(
  //     @AuthorizationToken() token: string,
  //     @Param('username') username: string,
  // ) {
  //     return this.service.followUser({
  //         token,
  //         username,
  //         value: true,
  //     });
  // }

  // /**
  //  * Follow user, authentication required.
  //  */
  // @Delete('profiles/:username/follow')
  // async unfollowUser(
  //     @AuthorizationToken() token: string,
  //     @Param('username') username: string,
  // ) {
  //     return this.service.followUser({
  //         token,
  //         username,
  //         value: false,
  //     });
  // }

  // /**
  //  * Feed Articles.
  //  * Return multiple articles created by followed users, ordered by most recent first.
  //  * Authentication required.
  //  */
  // @Get('articles/feed')
  // @UseInterceptors(TagListInterceptor)
  // async articlesFeed(
  //     @AuthorizationToken() token: string,
  //     @Query() query?: GetArticlesDto,
  // ) {
  //     return this.service.feedArticles({
  //         token,
  //         limit: query?.limit,
  //         offset: query?.offset,
  //     });
  // }

  // /**
  //  * Get article by slug.
  //  */
  // @Get('articles/:slug') // eslint-disable-line sonarjs/no-duplicate-string
  // @UseInterceptors(TagListInterceptor)
  // async getArticle(@AuthorizationToken() token: string, @Param('slug') slug: string) {
  //     return this.service.getArticle({ token, slug });
  // }

  // /**
  //  * Update article.
  //  * Authentication required.
  //  */
  // @Put('articles/:slug')
  // @UseInterceptors(TagListInterceptor)
  // async updateArticle(
  //     @AuthorizationToken() token: string,
  //     @Param('slug') slug: string,
  //     @Req() request: Request,
  // ) {
  //     return this.service.updateArticle({
  //         token,
  //         slug,
  //         data: request.body.article,
  //     });
  // }

  // /**
  //  * Delete article.
  //  * Authentication required.
  //  */
  // @Delete('articles/:slug')
  // @UseInterceptors(TagListInterceptor)
  // async deleteArticle(
  //     @AuthorizationToken() token: string,
  //     @Param('slug') slug: string,
  // ) {
  //     return this.service.deleteArticle({ token, slug });
  // }

  // /**
  //  * Add comments to an article.
  //  */
  // @Post('articles/:slug/comments')
  // async createArticleComment(
  //     @AuthorizationToken() token: string,
  //     @Param('slug') slug: string,
  //     @Body('comment') comment: CreateArticleCommentDto,
  // ) {
  //     return this.service.createArticleComment({ token, slug, comment });
  // }

  // /**
  //  * Get comments from an article.
  //  */
  // @Get('articles/:slug/comments')
  // async articleComments(
  //     @AuthorizationToken() token: string,
  //     @Param('slug') slug: string,
  // ) {
  //     return this.service.articleComments({ token, slug });
  // }

  // /**
  //  * Delete comment by id.
  //  */
  // @Delete('articles/:slug/comments/:id')
  // async deleteComment(@AuthorizationToken() token: string, @Param('id') id: string) {
  //     return this.service.deleteComment({ token, id });
  // }

  // /**
  //  * Favorite article by slug.
  //  * Authentication required.
  //  */
  // @Post('articles/:slug/favorite')
  // @UseInterceptors(TagListInterceptor)
  // async favoriteArticle(
  //     @AuthorizationToken() token: string,
  //     @Param('slug') slug: string,
  // ) {
  //     return this.service.favoriteArticle({ token, slug, value: true });
  // }

  // /**
  //  * Unfavorite article by slug.
  //  * Authentication required.
  //  */
  // @Delete('articles/:slug/favorite')
  // @UseInterceptors(TagListInterceptor)
  // async unfavoriteArticle(
  //     @AuthorizationToken() token: string,
  //     @Param('slug') slug: string,
  // ) {
  //     return this.service.favoriteArticle({ token, slug, value: false });
  // }

  // /**
  //  * Get tags.
  //  */
  // @Get('tags')
  // async tags() {
  //     return this.service.getTags();
  // }
}
