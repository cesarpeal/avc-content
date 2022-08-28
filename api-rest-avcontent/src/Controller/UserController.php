<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Validator\Validation;
use Symfony\Component\Validator\Constraints\Email;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

use App\Entity\User;
use App\Entity\Review;
use App\Services\JwtAuth;

class UserController extends AbstractController
{
    private function resjson($data){
        $json = $this->get('serializer')->serialize($data, 'json');
        $response = new Response();
        $response->setContent($json);
        $response->headers->set('Content-Type', 'application/json');
        return $response;
    }

    public function register(Request $request){
        $json = $request->get('json', null);
        $params = json_decode($json);

        $data = [
            'status' => 'error',
            'code' => 500,
            'message' => 'El usuario no se ha creado'
        ];

        if($json != null){
            $nickname = (!empty($params->nickname)) ? $params->nickname : null;
            $email = (!empty($params->email)) ? $params->email : null;
            $password = (!empty($params->email)) ? $params->password : null;

            $validator = Validation::createvalidator();
            $validate_email = $validator->validate($email, [new Email()]);

            if(!empty($nickname) && count($validate_email) == 0 && !empty($password)){
                $pwd = hash('sha256', $password);

                $user = new User();
                $user->setNickname($nickname);
                $user->setEmail($email);
                $user->setPassword($pwd);
                $user->setRole('user');
                $user->setStatus('active');

                $em = $this->getDoctrine()->getManager();
                $isset_user = $this->getDoctrine()->getRepository(User::class)->findOneBy(['email' => $email]);

                if(!$isset_user){
                    $em->persist($user);
                    $em->flush();

                    $data = [
                        'status' => 'success',
                        'code' => 200,
                        'message' => 'Se ha creado el usuario',
                        'user' => $user
                    ];
                } else {
                    $data = [
                        'status' => 'error',
                        'code' => 400,
                        'message' => 'El usuario ya existe'
                    ];
                }
            }
        }
        return $this->resjson($data);
    }

    public function login(Request $request, JwtAuth $jwt_auth){
        $json = $request->get('json', null);
        $params = json_decode($json);

        $data = [
            'status' => 'error',
            'code' => 400,
            'message' => 'Error al identificarse'
        ];

        if(!empty($json)){
            $email = (!empty($params->email)) ? $params->email : null;
            $password = (!empty($params->password)) ? $params->password : null;
            $gettoken = (!empty($params->gettoken)) ? $params->gettoken : null;

            $validator = Validation::createValidator();
            $validate_email = $validator->validate($email, [new Email()]);

            if(!empty($email) && !empty($password) && count($validate_email) == 0){
                $pwd = hash('sha256', $password);
            }

            if($gettoken){
                $signup = $jwt_auth->signup($email, $pwd, $gettoken);
            } else {
                $signup = $jwt_auth->signup($email, $pwd);
            }
        }
        return new JsonResponse($signup);
    }

    public function edit(Request $request, JwtAuth $jwt_auth){
       $json = $request->get('json', null);
       $params = json_decode($json);
       $token = $request->headers->get('Authorization', null);

       $authCheck = $jwt_auth->checkToken($token);

       $data = [
            'status' => 'error',
            'error' => 500,
            'message' => 'Error'
       ];

       if($authCheck){
            $em = $this->getDoctrine()->getManager();
            $identity = $jwt_auth->checkToken($token);
            $user = $this->getDoctrine()->getRepository(User::class)->findOneBy(['id' => $identity->sub]);

            if(!empty($json)){
                $nickname = (!empty($params->nickname)) ? $params->nickname : null;

                if(!empty($nickname)){
                    $user->setNickname($nickname);

                    $em->persist($user);
                    $em->flush();

                    $data = [
                        'status' => 'success',
                        'code' => 200,
                        'message' => 'Se ha cambiado el nickname',
                        'user' => $user
                    ];
                }
            }
        }
        return $this->resjson($data);
    }

    public function getUserIdentity(Request $request, JwtAuth $jwt_auth){
        $json = $request->get('json', null);
        $params = json_decode($json);

        if($params->user_id && $params->user_id != null){
            $user_id = $params->user_id;
        } else {
            $token = $request->headers->get('Authorization', null);
            $token = str_replace("'", "", $token);
            $identity = $jwt_auth->checkToken($token, true);
            $user_id = $identity->sub;
        }


        $user = $this->getDoctrine()->getRepository(User::class)->findOneBy(['id' => $user_id]);

        $data = [
            'status' => 'success',
            'code' => 200,
            'user' => $user
        ];

        return $this->resjson($data);
    }

    public function delete(Request $request){
        $token = $request->headers->get('Authorization', null);
        $identity = $jwt_auth->checkToken($token, true);
        $json = $request->get('json');
        $params = json_decode($json);

        if($params->user_id === $identity->sub){
            $user = $this->getDoctrine()->getRepository(User::class)->findOneBy(['id' => $user_id]);
            $user_reviews = $this->getDoctrine()->getRepository(Review::class)->findBy(['id' => $user->id]);

            $em = $this->getDoctrine()->getManager();

            for($c=0;$c<count($user_reviews);$c++){
                $em->remove($user_reviews[$c]);
            }
            $em->flush();

            $em->remove($user);
            $em->flush();

            $data = [
                'status' => 'success',
                'code' => 200,
                'user' => $user,
                'reviews' => $user_reviews
            ];
        }
        return $this->resjson($data);
    }

    public function uploadAvatar(Request $request, SluggerInterface $slugger, JwtAuth $jwt_auth){

        $data = [
            'status' => 'error',
            'code' => 400,
            'message' => 'Error al subir la imagen'
        ];
        $doctrine = $this->getDoctrine();
        $token = $request->headers->get('Authorization', null);
        $authCheck = $jwt_auth->checkToken($token);

        $json = $request->get('json', null);
        $params = json_decode($json);

        if($authCheck){
            //Sacamos el archivo
            $file = $request->files->get('filename', null);

            //Con esto renombramos el archivo, y seteamos el nombre para el objeto Foto
            $filename = $file->getClientOriginalName();
            $safeFilename = $slugger->slug($filename);
            $newFilename = uniqid().'-'.$safeFilename.'.'.$file->guessExtension();

            //Sacamos al usuario que está subiendo la imagen
            $identity = $jwt_auth->checkToken($token, true);
            if($identity){
                $user_id = (!empty($identity->sub)) ? $identity->sub : null;
                $user = $doctrine->getRepository(User::class)->findOneBy(['id' => $user_id]);

                if(!empty($file)){
                    //Y setteamos la imagen a subir a la bbdd
                    $user->setImage($newFilename);

                    //Subimos la imagen al directorio
                    $file->move(
                        $this->getParameter('avatars'),
                        $newFilename
                    );

                    //Y la metemos en la base de datos
                    $em = $doctrine->getManager();
                    $em->persist($user);
                    $em->flush();

                    $data = [
                        'status' => 'success',
                        'code' => '200',
                        'user' => $user
                    ];
                }
            } else {
                $data = [
                    'status' => 'error',
                    'code' => 400,
                    'message' => 'La imagen no corresponde al usuario'
                ];
            }
        }
        return $this->resjson($data);
    }

    public function getAvatar($filename = null){
        $path = $this->getParameter('avatars');

        return new BinaryFileResponse($path.'/'.$filename);
    }
}
