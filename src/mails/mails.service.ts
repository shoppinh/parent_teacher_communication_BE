import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Event } from 'src/event/schema/event.schema';
import { Post } from 'src/post/schema/post.schema';

@Injectable()
export class MailsService {
  constructor(private mailerService: MailerService) {}

  async sendUserInvitation(email: string, token: string) {
    const url = `${process.env.APP_URL}/register/${token}`;
    const home_url = process.env.APP_URL;
    const external_content = `<p>To finish setting up your account, simply click on your <a href="${url}">sign-up link</a></p>`;

    return this.mailerService
      .sendMail({
        to: email,
        // from: '"Support Team" <support@example.com>', // override default from
        subject: 'You have been invited to Niteco Performance Insight!',
        template: 'invitation', // `.hbs` extension is appended automatically
        context: {
          // ✏️ filling curly brackets with content
          name: email,
          home_url,
          external_content,
        },
      })
      .catch((error) => {
        console.log(Date(), 'error', error);
        throw new BadRequestException("Can't send invitation email");
      });
  }

  async sendUserEventNotification(email: string[], event: Event) {
    return this.mailerService
      .sendMail({
        to: email,
        subject: 'You have been invited a meeting!',
        template: 'event-invitation', // `.hbs` extension is appended automatically
        context: {
          // ✏️ filling curly brackets with content
          eventName: event.title,
          eventStart: event.start,
          eventEnd: event.end,
          eventContent: event.content,
        },
      })
      .catch((error) => {
        console.log(Date(), 'error', error);
        throw new BadRequestException("Can't send meeting invitation email");
      });
  }

  async sendUserPostNotification(email: string[], post: Post) {
    return this.mailerService
      .sendMail({
        to: email,
        subject: 'Your class has a new post!',
        template: 'class-post-notification',
        context: {
          postTitle: post.title,
          postDescription: post.description,
        },
      })
      .catch((error) => {
        console.log(Date(), 'error', error);
        throw new BadRequestException("Can't send class post notification email");
      });
  }
}
